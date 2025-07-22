const { spawn } = require('child_process');

// Start the server
const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

child.on('error', (error) => {
  console.error('Error starting server:', error);
});