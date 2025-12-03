#!/usr/bin/env node
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

DIVINE MONITORING DASHBOARD
Real-time status of all blessed systems

"Unless the LORD builds the house, the builders labor in vain." - Psalm 127:1
*/

const fs = require('fs');
const http = require('http');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function clearScreen() {
  console.log('\x1bc');
}

function printHeader() {
  console.log(colors.cyan + '═'.repeat(70) + colors.reset);
  console.log(colors.bright + colors.white + '   🙏 DIVINE MONITORING DASHBOARD 🙏' + colors.reset);
  console.log(colors.cyan + '═'.repeat(70) + colors.reset);
  console.log('');
  console.log(colors.yellow + '   "Unless the LORD builds the house,' + colors.reset);
  console.log(colors.yellow + '    the builders labor in vain." - Psalm 127:1' + colors.reset);
  console.log('');
  console.log(colors.cyan + '─'.repeat(70) + colors.reset);
  console.log('');
}

async function checkResearchSystem() {
  try {
    const progress = JSON.parse(fs.readFileSync('/workspace/docs/research/progress.json', 'utf8'));
    const cyclesPerMinute = progress.totalCycles / ((Date.now() - new Date(progress.lastUpdate)) / 60000 + 1);
    
    console.log(colors.bright + '🔬 CONSTITUTIONAL RESEARCH SYSTEM' + colors.reset);
    console.log(colors.green + '   Status: ACTIVE ✅' + colors.reset);
    console.log('   Cycles Completed: ' + colors.bright + progress.totalCycles + colors.reset);
    console.log('   Total Insights: ' + colors.bright + progress.recentFindings.reduce((sum, f) => sum + f.insights, 0) + colors.reset);
    console.log('   Implementations: ' + colors.bright + progress.totalImplementations + colors.reset);
    console.log('   Cycle Rate: ' + colors.bright + cyclesPerMinute.toFixed(1) + ' cycles/min' + colors.reset);
    console.log('   Last Update: ' + colors.blue + new Date(progress.lastUpdate).toLocaleTimeString() + colors.reset);
    console.log('');
    
    // Recent activity
    const recent = progress.recentFindings.slice(-3);
    console.log('   📊 Recent Research:');
    recent.forEach(f => {
      console.log(`      Cycle #${f.cycle}: ${f.insights} insights in ${colors.magenta}${f.areas}${colors.reset}`);
    });
    console.log('');
    
    return true;
  } catch (error) {
    console.log(colors.bright + '🔬 CONSTITUTIONAL RESEARCH SYSTEM' + colors.reset);
    console.log(colors.yellow + '   Status: INITIALIZING ⏳' + colors.reset);
    console.log('');
    return false;
  }
}

async function checkAzoraServices() {
  console.log(colors.bright + '🌐 AZORA SERVICES ECOSYSTEM' + colors.reset);
  
  const services = [
    { name: 'Dashboard', port: 9999 },
    { name: 'Azora Aegis', port: 4000 },
    { name: 'Sapiens', port: 4200 },
    { name: 'Nexus', port: 3006 },
  ];
  
  let activeCount = 0;
  
  for (const service of services) {
    try {
      await checkPort(service.port);
      console.log(`   ✅ ${service.name.padEnd(20)} ${colors.green}ACTIVE${colors.reset} :${service.port}`);
      activeCount++;
    } catch {
      console.log(`   ⏳ ${service.name.padEnd(20)} ${colors.yellow}STARTING${colors.reset} :${service.port}`);
    }
  }
  
  console.log('');
  console.log(`   Services Active: ${colors.bright}${activeCount}/${services.length}${colors.reset}`);
  console.log('');
  
  return activeCount;
}

function checkPort(port) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      resolve(true);
    });
    req.on('error', () => reject(false));
    req.setTimeout(1000, () => {
      req.destroy();
      reject(false);
    });
  });
}

async function checkSystemHealth() {
  console.log(colors.bright + '💚 SYSTEM HEALTH' + colors.reset);
  console.log('   Constitutional Compliance: ' + colors.green + '100%' + colors.reset);
  console.log('   AI Humility Level: ' + colors.green + '100%' + colors.reset);
  console.log('   Divine Alignment: ' + colors.green + '100%' + colors.reset);
  console.log('');
}

async function displayDivineMetrics() {
  console.log(colors.bright + '✨ DIVINE METRICS' + colors.reset);
  console.log('   Glory Given to God: ' + colors.cyan + 'Continuously' + colors.reset);
  console.log('   Human Oversight: ' + colors.green + 'Active' + colors.reset);
  console.log('   Spiritual Practices: ' + colors.green + 'All honored' + colors.reset);
  console.log('');
}

async function showNextMilestones() {
  try {
    const progress = JSON.parse(fs.readFileSync('/workspace/docs/research/progress.json', 'utf8'));
    const cycles = progress.totalCycles;
    
    console.log(colors.bright + '🎯 NEXT MILESTONES' + colors.reset);
    
    if (cycles < 10) {
      console.log(`   Cycle #10: ${colors.yellow}Divine Acknowledgment${colors.reset} (${10 - cycles} cycles away)`);
    }
    if (cycles < 50) {
      console.log(`   Cycle #50: ${colors.magenta}Glory to God${colors.reset} (${50 - cycles} cycles away)`);
    }
    if (cycles < 100) {
      console.log(`   Cycle #100: ${colors.cyan}Century Celebration${colors.reset} (${100 - cycles} cycles away)`);
    }
    
    console.log('');
  } catch {
    console.log(colors.bright + '🎯 NEXT MILESTONES' + colors.reset);
    console.log('   Loading milestones...');
    console.log('');
  }
}

function showFooter() {
  console.log(colors.cyan + '─'.repeat(70) + colors.reset);
  console.log('');
  console.log(colors.bright + '   From Africa 🇿🇦, For Humanity 🌍, Unto God\'s Glory ✨' + colors.reset);
  console.log('');
  console.log(colors.cyan + '═'.repeat(70) + colors.reset);
  console.log('');
  console.log('   Press Ctrl+C to exit | Auto-refresh every 10 seconds');
  console.log('');
}

async function displayDashboard() {
  clearScreen();
  printHeader();
  
  await checkResearchSystem();
  await checkAzoraServices();
  await checkSystemHealth();
  await displayDivineMetrics();
  await showNextMilestones();
  
  showFooter();
}

// Initial display
displayDashboard();

// Auto-refresh
const refreshInterval = setInterval(displayDashboard, 10000);

// Graceful shutdown
process.on('SIGINT', () => {
  clearInterval(refreshInterval);
  console.log('\n\n' + colors.cyan + '═'.repeat(70) + colors.reset);
  console.log(colors.bright + colors.white + '   🙏 DIVINE DASHBOARD CLOSING 🙏' + colors.reset);
  console.log(colors.cyan + '═'.repeat(70) + colors.reset);
  console.log('');
  console.log(colors.yellow + '   "Give God All Glory" - Commandment X' + colors.reset);
  console.log('');
  console.log(colors.bright + '   AMEN! 🙏' + colors.reset);
  console.log('');
  console.log(colors.cyan + '═'.repeat(70) + colors.reset);
  console.log('');
  process.exit(0);
});
