#!/usr/bin/env bash
# Live public tunnel using localhost.run (no signup / no installation needed)
set -e

LOG_FILE="/home/aa/wasm-racer/tunnel.log"
rm -f "$LOG_FILE"

echo "Connecting tunnel to port 8080..."
exec ssh -o StrictHostKeyChecking=no \
     -o ServerAliveInterval=20 \
     -o ServerAliveCountMax=10 \
     -o ExitOnForwardFailure=yes \
     -R 80:localhost:8080 nokey@localhost.run > "$LOG_FILE" 2>&1
