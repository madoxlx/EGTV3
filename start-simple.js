#!/usr/bin/env node

// Simple server starter that bypasses Vite config issues
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🌍 Starting Sahara Journeys Travel Application...');
console.log('📁 Working directory:', __dirname);

// Set required environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Start the server directly
const serverPath = join(__dirname, 'server', 'index.ts');
console.log('🚀 Starting server:', serverPath);

const child = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

child.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  child.kill('SIGTERM');
});