#!/usr/bin/env node

/**
 * Production build script with Node.js v18 compatibility
 * This script builds the project and patches it for compatibility with Node.js v18
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('Building client...');
  execSync('vite build', { stdio: 'inherit' });
  
  console.log('Building server with Node.js v18 target...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --target=node18 --outdir=dist', { stdio: 'inherit' });
  
  console.log('Patching for Node.js v18 compatibility...');
  
  let content = readFileSync('./dist/index.js', 'utf8');
  
  // Replace import.meta.dirname with Node.js v18 compatible code
  content = content.replace(
    /import\.meta\.dirname/g,
    'path.dirname(fileURLToPath(import.meta.url))'
  );
  
  // Add the necessary import at the top of the file
  const importStatement = `import { fileURLToPath } from 'url';\n`;
  
  // Find the first import statement and add our import after it
  const firstImportIndex = content.indexOf('import ');
  if (firstImportIndex !== -1) {
    const nextLineIndex = content.indexOf('\n', firstImportIndex);
    content = content.slice(0, nextLineIndex + 1) + importStatement + content.slice(nextLineIndex + 1);
  }
  
  writeFileSync('./dist/index.js', content);
  
  console.log('Production build completed successfully!');
  console.log('The server is now compatible with Node.js v18.20.8');
  console.log('Run: npm start');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}