#!/usr/bin/env bash
# Velocity 3D Arcade Racing Game Launcher

set -e

PORT=${1:-8080}
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/web"

echo "=========================================================="
echo "🏎️  Starting Velocity 3D Arcade Racing Game..."
echo "=========================================================="
echo "Serving directory: ${DIR}"
echo "URL: http://localhost:${PORT}"
echo ""
echo "Press Ctrl+C to stop the server."
echo "=========================================================="

python3 -m http.server "${PORT}" --directory "${DIR}"
