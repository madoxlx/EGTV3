#!/bin/bash
# Development server startup script with ESM support for TSX
export NODE_ENV=development
export NODE_OPTIONS="--import tsx/esm"
tsx server/index.ts