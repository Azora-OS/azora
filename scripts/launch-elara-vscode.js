/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class ElaraVSCodeLauncher {
  constructor() {
    this.extensionPath = path.join(__dirname, '..', 'tools', 'elara-vscode-extension');
  }

  async launch() {
    console.log('🤖 Elara VS Code Extension Launcher');
    
    try {
      await this.buildExtension();
      await this.installExtension();
      await this.launchVSCode();
      
      console.log('✅ Elara VS Code extension launched successfully');
    } catch (error) {
      console.error('❌ Failed to launch Elara extension:', error.message);
      process.exit(1);
    }
  }

  async buildExtension() {
    console.log('🔨 Building Elara VS Code extension...');
    
    process.chdir(this.extensionPath);
    
    // Install dependencies
    execSync('npm install', { stdio: 'inherit' });
    
    // Compile TypeScript
    execSync('npm run compile', { stdio: 'inherit' });
    
    // Package extension
    try {
      execSync('vsce package', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ VSCE not found, installing...');
      execSync('npm install -g vsce', { stdio: 'inherit' });
      execSync('vsce package', { stdio: 'inherit' });
    }
    
    console.log('✅ Extension built successfully');
  }

  async installExtension() {
    console.log('📦 Installing Elara VS Code extension...');
    
    const vsixFiles = fs.readdirSync(this.extensionPath).filter(f => f.endsWith('.vsix'));
    
    if (vsixFiles.length === 0) {
      throw new Error('No VSIX file found');
    }
    
    const vsixPath = path.join(this.extensionPath, vsixFiles[0]);
    
    try {
      execSync(`code --install-extension "${vsixPath}"`, { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ VS Code CLI not found, trying alternative method...');
      console.log(`Please manually install: ${vsixPath}`);
    }
    
    console.log('✅ Extension installed successfully');
  }

  async launchVSCode() {
    console.log('🚀 Launching VS Code with Elara...');
    
    try {
      execSync('code .', { 
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit' 
      });
      
      setTimeout(() => {
        console.log('🤖 Elara: Hello! I am now active in VS Code!');
        console.log('💡 Try these commands:');
        console.log('   - Ctrl+Shift+P -> "Elara: Hello World"');
        console.log('   - Ctrl+Shift+P -> "Elara: Ask Question"');
        console.log('   - Right-click code -> Elara options');
      }, 3000);
      
    } catch (error) {
      console.log('⚠️ Could not launch VS Code automatically');
      console.log('Please open VS Code manually and activate Elara');
    }
  }
}

if (require.main === module) {
  const launcher = new ElaraVSCodeLauncher();
  launcher.launch();
}

module.exports = ElaraVSCodeLauncher;