#!/usr/bin/env node

/**
 * Build script for Node.js v18 compatibility
 * This script rebuilds the project with Node.js v18 target to avoid import.meta.dirname issues
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('Building client...');
  execSync('vite build', { stdio: 'inherit' });
  
  console.log('Building server with Node.js v18 target...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --target=node18 --outdir=dist', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}