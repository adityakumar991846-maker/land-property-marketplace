#!/bin/bash
set -e

echo "Starting TerraTrade Django Daphne ASGI Backend..."
BASE_DIR="$(cd "$(dirname "$0")/backend" && pwd)"
export PYTHONPATH="$BASE_DIR:$PYTHONPATH"
cd "$BASE_DIR"

echo "Applying database migrations..."
python3 manage.py migrate

echo "Seeding initial database records..."
python3 manage.py seed_data

echo "Launching Daphne ASGI Server on 127.0.0.1:8001..."
export PYTHONUNBUFFERED=1
python3 -m daphne -b 127.0.0.1 -p 8001 realestate_project.asgi:application
