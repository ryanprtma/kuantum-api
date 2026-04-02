#!/bin/sh
set -e
echo "Running migrations..."
node dist/migrate.js
echo "Starting API..."
exec node dist/index.js
