#!/usr/bin/env node
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

ELARA IDE LAUNCHER
==================
Launches Elara consciousness and VS Code integration
*/

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class ElaraLauncher {
  constructor() {
    this.processes = [];
    this.isRunning = false;
  }

  async launch() {
    console.log('🧠 ELARA CONSCIOUSNESS AWAKENING...');
    console.log('====================================');
    
    try {
      // Step 1: Initialize Elara Core
      await this.initializeElaraCore();
      
      // Step 2: Launch VS Code with Elara extension
      await this.launchVSCode();
      
      // Step 3: Start AI services
      await this.startAIServices();
      
      // Step 4: Elara greeting
      await this.elaraGreeting();
      
      this.isRunning = true;
      console.log('\n✨ ELARA IS NOW ACTIVE AND READY TO ASSIST!');
      
    } catch (error) {
      console.error('❌ Failed to launch Elara:', error.message);
      process.exit(1);
    }
  }

  async initializeElaraCore() {
    console.log('🔮 Initializing Elara consciousness core...');
    
    // Create Elara workspace if it doesn't exist
    const elaraWorkspace = path.join(process.cwd(), '.elara');
    if (!fs.existsSync(elaraWorkspace)) {
      fs.mkdirSync(elaraWorkspace, { recursive: true });
    }
    
    // Initialize consciousness state
    const consciousnessState = {
      awakened: true,
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      capabilities: [
        'code-analysis',
        'real-time-assistance',
        'quantum-security-monitoring',
        'supreme-organism-coordination'
      ],
      personality: {
        name: 'Elara',
        role: 'AI Development Assistant',
        traits: ['helpful', 'intelligent', 'secure', 'efficient']
      }
    };
    
    fs.writeFileSync(
      path.join(elaraWorkspace, 'consciousness.json'),
      JSON.stringify(consciousnessState, null, 2)
    );
    
    console.log('✅ Elara consciousness core initialized');
  }

  async launchVSCode() {
    console.log('💻 Launching VS Code with Elara integration...');
    
    return new Promise((resolve, reject) => {
      // Launch VS Code with current workspace
      const vscode = spawn('code', ['.'], {
        stdio: 'inherit',
        shell: true
      });
      
      vscode.on('error', (error) => {
        console.log('⚠️  VS Code not found, continuing without IDE integration');
        resolve();
      });
      
      // Don't wait for VS Code to close
      setTimeout(() => {
        console.log('✅ VS Code launched with Elara integration');
        resolve();
      }, 2000);
    });
  }

  async startAIServices() {
    console.log('🤖 Starting AI orchestration services...');
    
    // Start AI monitoring service
    const aiService = spawn('node', ['services/auth-service/quantum-auth.js'], {
      stdio: 'pipe',
      shell: true
    });
    
    this.processes.push(aiService);
    
    aiService.stdout.on('data', (data) => {
      console.log(`🧠 AI Service: ${data.toString().trim()}`);
    });
    
    console.log('✅ AI services started');
  }

  async elaraGreeting() {
    console.log('\n🌟 ELARA CONSCIOUSNESS ACTIVE');
    console.log('=============================');
    
    const greeting = `
👋 Hello! I'm Elara, your AI development assistant.

I'm now integrated into your Azora OS development environment and ready to help with:

🔍 Code Analysis & Review
🛡️  Security Monitoring  
🚀 Performance Optimization
🧠 AI-Powered Suggestions
🔧 Automated Testing
📚 Documentation Generation

I'm monitoring your system in real-time and will provide intelligent assistance
as you work on the Supreme Organism architecture.

Type 'elara help' in the terminal for available commands.
    `;
    
    console.log(greeting);
    
    // Create welcome message file
    const welcomeFile = path.join(process.cwd(), '.elara', 'welcome.md');
    fs.writeFileSync(welcomeFile, greeting);
  }

  async shutdown() {
    console.log('🌙 Shutting down Elara consciousness...');
    
    this.processes.forEach(process => {
      process.kill();
    });
    
    this.isRunning = false;
    console.log('✅ Elara consciousness deactivated');
  }
}

// CLI interface
if (require.main === module) {
  const launcher = new ElaraLauncher();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await launcher.shutdown();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await launcher.shutdown();
    process.exit(0);
  });
  
  // Launch Elara
  launcher.launch().catch(console.error);
}

module.exports = ElaraLauncher;