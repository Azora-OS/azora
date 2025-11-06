#!/usr/bin/env node
/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const fs = require('fs');
const path = require('path');

function cleanEchoStatements(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other directories we don't want to modify
      if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'dist') {
        continue;
      }
      cleanEchoStatements(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.jsx')) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remove "ECHO is off." lines
        const lines = content.split('\n');
        const cleanedLines = lines.filter(line => !line.trim().startsWith('ECHO is off.'));
        
        if (lines.length !== cleanedLines.length) {
          const cleanedContent = cleanedLines.join('\n');
          fs.writeFileSync(filePath, cleanedContent, 'utf8');
          console.log(`Cleaned: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
      }
    }
  }
}

console.log('🧹 Cleaning ECHO statements from files...');
cleanEchoStatements('.');
console.log('✅ Cleanup complete!');

