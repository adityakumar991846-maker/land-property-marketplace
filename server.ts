import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const DJANGO_PORT = 8001;
const DJANGO_HOST = '127.0.0.1';

let daphneProcess: ChildProcess | null = null;

// Ensure database and migrations are up-to-date
function initializeDjango(): Promise<void> {
  return new Promise((resolve) => {
    console.log('[Django] Checking database migrations and initial seed data...');
    const backendDir = path.join(process.cwd(), 'backend');

    const migrate = spawn('python3', ['manage.py', 'migrate'], { cwd: backendDir });
    migrate.on('close', (code) => {
      console.log(`[Django] Migrations completed with code ${code}`);
      const seed = spawn('python3', ['manage.py', 'seed_data'], { cwd: backendDir });
      seed.on('close', (seedCode) => {
        console.log(`[Django] Seed data check completed with code ${seedCode}`);
        resolve();
      });
    });
  });
}

// Start Daphne ASGI server for real-time WebSockets & Django REST API
function startDaphne(): void {
  const backendDir = path.join(process.cwd(), 'backend');
  console.log(`[Daphne] Launching ASGI server on ${DJANGO_HOST}:${DJANGO_PORT}...`);

  daphneProcess = spawn('daphne', [
    '-b', DJANGO_HOST,
    '-p', `${DJANGO_PORT}`,
    'realestate_project.asgi:application'
  ], {
    cwd: backendDir,
    stdio: 'inherit',
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });

  daphneProcess.on('error', (err) => {
    console.error('[Daphne] Error starting Daphne:', err);
  });

  daphneProcess.on('exit', (code, signal) => {
    console.log(`[Daphne] Process exited with code ${code}, signal ${signal}`);
  });
}

// Proxy middleware to forward API, Admin, Media, and WebSockets to Django
const djangoProxy = createProxyMiddleware({
  target: `http://${DJANGO_HOST}:${DJANGO_PORT}`,
  changeOrigin: true,
  ws: true,
  on: {
    error: (err, _req, res) => {
      console.warn('[Proxy] Connection note to Django:', err.message);
      if (res && 'writeHead' in res && typeof (res as any).writeHead === 'function') {
        (res as any).writeHead(502, { 'Content-Type': 'application/json' });
        (res as any).end(JSON.stringify({ error: 'Backend service initializing, please retry momentarily.' }));
      }
    }
  }
});

// Mount Django proxies before Vite middlewares
app.use('/api', djangoProxy);
app.use('/admin', djangoProxy);
app.use('/media', djangoProxy);

// Clean up child processes on shutdown
process.on('SIGINT', () => {
  if (daphneProcess) daphneProcess.kill('SIGINT');
  process.exit();
});
process.on('SIGTERM', () => {
  if (daphneProcess) daphneProcess.kill('SIGTERM');
  process.exit();
});

const server = http.createServer(app);

// Handle WebSocket upgrade
server.on('upgrade', (req, socket, head) => {
  if (req.url && (req.url.startsWith('/ws') || req.url.startsWith('/chat'))) {
    (djangoProxy as any).upgrade(req, socket, head);
  }
});

async function main() {
  await initializeDjango();
  startDaphne();

  // Mount Vite middleware in dev so internal control plane & static serving work properly
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` TerraTrade Land & Property Marketplace running!`);
    console.log(` Frontend URL:  http://0.0.0.0:${PORT}`);
    console.log(` Django ASGI:   http://${DJANGO_HOST}:${DJANGO_PORT}`);
    console.log(` WebSockets:    ws://0.0.0.0:${PORT}/ws/chat/<id>/`);
    console.log(`=======================================================`);
  });
}

main().catch(console.error);
