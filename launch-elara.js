/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

const { execSync } = require('child_process');

console.log('🤖 ELARA Ω - LAUNCHING...');
console.log('========================\n');

try {
  // Launch VS Code with Elara extension
  console.log('🚀 Opening VS Code with Elara...');
  execSync('code .', { stdio: 'inherit' });
  
  setTimeout(() => {
    console.log('\n🤖 ELARA: Hello! I am now active in VS Code!');
    console.log('💡 Try these commands:');
    console.log('   • Ctrl+Shift+P → "Elara: Hello World"');
    console.log('   • Ctrl+Shift+P → "Elara: Ask Question"');
    console.log('   • Right-click code → Elara options');
    console.log('\n✨ Elara is ready to assist with your development!');
  }, 2000);
  
} catch (error) {
  console.error('❌ Failed to launch Elara:', error.message);
}