import path from 'path';
import fs from 'fs';
import http from 'http';
import { spawn } from 'child_process';
import { defineConfig } from 'vite';

const projectRoot = typeof import.meta.dirname === 'string' ? import.meta.dirname : path.resolve('.');

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@': projectRoot,
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/ws': {
          target: 'ws://127.0.0.1:8001',
          ws: true,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      {
        name: 'terratrade-static-and-api-handler',
        configureServer(server) {
          // Auto-spawn Daphne ASGI backend on port 8001 if not running
          const checkAndSpawnDaphne = () => {
            const probe = http.request(
              { hostname: '127.0.0.1', port: 8001, path: '/api/properties/featured/', timeout: 1000 },
              () => {}
            );
            probe.on('error', () => {
              console.log('[TerraTrade Gateway] Spawning Daphne ASGI backend on port 8001...');
              const backendDir = path.join(projectRoot, 'backend');
              const daphne = spawn(
                'python3',
                ['-m', 'daphne', '-b', '127.0.0.1', '-p', '8001', 'realestate_project.asgi:application'],
                {
                  cwd: backendDir,
                  detached: true,
                  stdio: 'ignore',
                  env: {
                    ...process.env,
                    PYTHONPATH: `${backendDir}:${process.env.PYTHONPATH || ''}`,
                    PYTHONUNBUFFERED: '1',
                  },
                }
              );
              daphne.unref();
            });
            probe.end();
          };
          checkAndSpawnDaphne();

          // 1. Static asset serving for /js/* and /css/*
          server.middlewares.use((req, res, next) => {
            const rawUrl = req.url || '';
            const pathname = rawUrl.split('?')[0];
            if (pathname.startsWith('/js/') || pathname.startsWith('/css/')) {
              const filePath = path.join(projectRoot, pathname);
              if (fs.existsSync(filePath)) {
                const ext = path.extname(filePath);
                const contentType =
                  ext === '.js'
                    ? 'application/javascript; charset=utf-8'
                    : ext === '.css'
                    ? 'text/css; charset=utf-8'
                    : 'text/plain';
                res.setHeader('Content-Type', contentType);
                return fs.createReadStream(filePath).pipe(res);
              }
            }
            next();
          });

          // 2. Safe API & Admin proxy middleware without unhandled socket errors
          server.middlewares.use((req, res, next) => {
            const rawUrl = req.url || '';
            const pathname = rawUrl.split('?')[0];

            if (
              !pathname.startsWith('/api/') &&
              !pathname.startsWith('/admin') &&
              !pathname.startsWith('/media/')
            ) {
              return next();
            }

            // Health endpoint check
            if (pathname === '/api/health' || pathname === '/api/health/') {
              let responded = false;
              const sendHealth = (djangoActive: boolean) => {
                if (responded || res.headersSent) return;
                responded = true;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ django_active: djangoActive, client_store: !djangoActive }));
              };

              const probe = http.request(
                {
                  hostname: '127.0.0.1',
                  port: 8001,
                  path: '/api/properties/featured/',
                  method: 'GET',
                  timeout: 3000,
                },
                (probeRes) => {
                  sendHealth(probeRes.statusCode === 200);
                }
              );

              probe.on('error', () => {
                sendHealth(false);
              });

              probe.on('timeout', () => {
                probe.destroy();
                sendHealth(false);
              });

              probe.end();
              return;
            }

            // Forward to Django backend if active
            let proxyResponded = false;
            const sendFallback = () => {
              if (proxyResponded || res.headersSent) return;
              proxyResponded = true;
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'offline', message: 'Handled via client store' }));
            };

            const proxyReq = http.request(
              {
                hostname: '127.0.0.1',
                port: 8001,
                path: rawUrl,
                method: req.method,
                headers: {
                  ...req.headers,
                  host: '127.0.0.1:8001',
                },
                timeout: 30000,
              },
              (proxyRes) => {
                if (proxyResponded || res.headersSent) return;
                proxyResponded = true;
                res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
                proxyRes.pipe(res);
              }
            );

            proxyReq.on('error', () => {
              sendFallback();
            });

            proxyReq.on('timeout', () => {
              proxyReq.destroy();
              sendFallback();
            });

            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
              req.pipe(proxyReq);
            } else {
              proxyReq.end();
            }
          });
        },
      },
    ],
  };
});
