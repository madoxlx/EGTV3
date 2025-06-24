const { spawn } = require('child_process');
const path = require('path');

// Start the development server
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  cwd: '/home/runner/workspace',
  stdio: 'inherit',
  detached: false
});

console.log('Starting server...');

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('Stopping server...');
  serverProcess.kill();
  process.exit();
});