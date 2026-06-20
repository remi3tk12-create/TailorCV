#!/bin/bash

# Exit immediately if any command fails
set -e

echo "=================================================="
echo " Starting TailorCV Local Development Environment"
echo "=================================================="

# Determine directory paths dynamically
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "Backend path: $BACKEND_DIR"
echo "Frontend path: $FRONTEND_DIR"

# Global PIDs to terminate
BACKEND_PID=""
FRONTEND_PID=""

# Graceful cleanup on Ctrl+C (SIGINT / SIGTERM)
cleanup() {
  echo ""
  echo "=================================================="
  echo " Shutting down TailorCV local development..."
  echo "=================================================="
  if [ -n "$BACKEND_PID" ]; then
    echo "Stopping backend server (PID $BACKEND_PID)..."
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    echo "Stopping frontend server (PID $FRONTEND_PID)..."
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  exit 0
}

# Trap terminal exits to clean up child processes
trap cleanup SIGINT SIGTERM EXIT

# 1. Start Backend Server
echo "-> Launching Express Backend Server..."
cd "$BACKEND_DIR"
if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies first..."
  npm install
fi
# Start express server with hot reload
npm run dev &
BACKEND_PID=$!
echo "Backend running in background with PID $BACKEND_PID"

# 2. Start Frontend Server
echo "-> Launching React / Vite Frontend Server..."
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies first..."
  npm install
fi
# Start Vite development server
npm run dev &
FRONTEND_PID=$!
echo "Backend running in background with PID $FRONTEND_PID"

echo "=================================================="
echo " Dev Environment is live!"
echo " - Backend API: http://localhost:3000"
echo " - Frontend Web: http://localhost:5173"
echo " Press [Ctrl+C] to stop both servers."
echo "=================================================="

# Keep the script running in the foreground to hold child processes and capture output
wait
