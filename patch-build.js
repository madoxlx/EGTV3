#!/usr/bin/env node

/**
 * Patch script to replace import.meta.dirname with Node.js v18 compatible code
 * This fixes the production build to work with Node.js v18.20.8
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('Patching dist/index.js for Node.js v18 compatibility...');
  
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
  
  console.log('Patching completed successfully!');
  console.log('The server should now work with Node.js v18.20.8');
} catch (error) {
  console.error('Patching failed:', error);
  process.exit(1);
}