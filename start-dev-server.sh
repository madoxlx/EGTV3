#!/bin/bash
# Development server startup script with ESM support for TSX
# Application will be accessible on port 8080
export NODE_ENV=development
export NODE_OPTIONS="--import tsx/esm"
echo "🚀 Starting Sahara Journeys on port 8080..."
tsx server/index.ts