#!/bin/bash

echo ""
echo "============================================================"
echo "  Video Caption Suite"
echo "============================================================"
echo ""

cd "$(dirname "$0")"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "ERROR: Virtual environment not found"
    echo "Please run ./install.sh first"
    exit 1
fi

# Activate venv
source venv/bin/activate

echo "Starting server on http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start the server
python -m uvicorn backend.api:app --host 0.0.0.0 --port 8000
