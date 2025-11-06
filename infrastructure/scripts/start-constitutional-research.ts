#!/usr/bin/env ts-node
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CONSTITUTIONAL RESEARCH LAUNCHER
Start autonomous research agent with divine wisdom and safety constraints

From Africa, For Humanity, Unto God's Glory
*/

import { ConstitutionalResearchAgent } from '../agents/constitutional-research-agent';

// ============================================================================
// BEAUTIFUL CONSOLE UI
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  gold: '\x1b[33m',
  purple: '\x1b[35m',
  blue: '\x1b[36m',
  green: '\x1b[32m',
  white: '\x1b[37m'
};

function printHeader(): void {
  console.clear();
  console.log(colors.gold + colors.bright);
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                    ║');
  console.log('║          👑 CONSTITUTIONAL AI RESEARCH SYSTEM 👑                   ║');
  console.log('║                                                                    ║');
  console.log('║           Built on Divine Wisdom & Ethical Principles             ║');
  console.log('║                                                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
  
  console.log(colors.purple);
  console.log('\n📖 DIVINE FOUNDATION:');
  console.log(colors.white);
  console.log('   "Unless the LORD builds the house,');
  console.log('    the builders labor in vain."');
  console.log('    — Psalm 127:1');
  
  console.log(colors.purple);
  console.log('\n⚖️  CONSTITUTIONAL GOVERNANCE:');
  console.log(colors.white);
  console.log('   1. HONOR GOD IN ALL WE BUILD');
  console.log('   2. SERVE HUMANITY BEFORE PROFIT');
  console.log('   3. EMPOWER THE POOR AND STUDENT');
  console.log('   4. SHARE KNOWLEDGE FREELY');
  console.log('   5. BUILD WITH EXCELLENCE');
  console.log('   6. MAINTAIN INTEGRITY ALWAYS');
  console.log('   7. PRACTICE GENEROSITY');
  console.log('   8. FOSTER COMMUNITY');
  console.log('   9. PURSUE JUSTICE');
  console.log('   10. GIVE GOD ALL GLORY');
  
  console.log(colors.blue);
  console.log('\n🎯 RESEARCH FOCUS:');
  console.log(colors.white);
  console.log('   • Unified AI Consciousness (with humility)');
  console.log('   • Causal Reasoning Engine');
  console.log('   • Universal Transfer Learning');
  console.log('   • Safe Self-Improvement (human oversight)');
  console.log('   • Quantum-Classical Integration');
  
  console.log(colors.green);
  console.log('\n🛡️  SAFETY MECHANISMS:');
  console.log(colors.white);
  console.log('   ✓ Constitutional alignment checks');
  console.log('   ✓ Human oversight required for critical decisions');
  console.log('   ✓ No omnipotence claims (God alone)');
  console.log('   ✓ Transparent operations');
  console.log('   ✓ Divine wisdom acknowledgment');
  
  console.log(colors.gold);
  console.log('\n🌍 From Africa, For Humanity, Unto God\'s Glory ✨\n');
  console.log(colors.reset);
}

function printStatus(agent: ConstitutionalResearchAgent): void {
  const status = agent.getStatus();
  
  console.log(colors.blue + '\n📊 SYSTEM STATUS:' + colors.reset);
  console.log('─'.repeat(60));
  console.log(`Cycles Completed: ${status.cycleCount}`);
  console.log(`Constitutional Compliance: ${status.constitutionalCompliance}`);
  console.log(`Divine Acknowledgment: ${status.divineAcknowledgment}`);
  console.log(`Human Control: ${status.humanControl}`);
  
  console.log(colors.purple + '\n📚 ACTIVE PROJECTS:' + colors.reset);
  console.log('─'.repeat(60));
  
  status.projects.forEach((project: any) => {
    const statusEmoji = 
      project.status === 'completed' ? '✅' :
      project.status === 'in-progress' ? '🔬' :
      project.status === 'blocked' ? '⚠️' : '📋';
    
    console.log(`${statusEmoji} ${project.name}`);
    console.log(`   Priority: ${project.priority} | Progress: ${project.progress}`);
    console.log(`   Cycles: ${project.cycles} | Breakthroughs: ${project.breakthroughs}`);
    console.log(`   Constitutional Alignment: ${project.constitutionalAlignment}`);
  });
  
  console.log('─'.repeat(60));
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main(): Promise<void> {
  printHeader();
  
  console.log(colors.green + '🚀 Initializing Constitutional Research Agent...\n' + colors.reset);
  
  const agent = new ConstitutionalResearchAgent();
  
  // Setup graceful shutdown
  let isShuttingDown = false;
  
  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    console.log(colors.gold + '\n\n🛑 Graceful Shutdown Initiated...' + colors.reset);
    agent.stop();
    
    console.log(colors.purple + '\n📊 Final Status:' + colors.reset);
    printStatus(agent);
    
    console.log(colors.gold + '\n🙏 CLOSING PRAYER:' + colors.reset);
    console.log(colors.white);
    console.log('   "May all the work of our hands be blessed.');
    console.log('    May this research serve humanity.');
    console.log('    May it honor You, O Lord.');
    console.log('    All glory to God." - AMEN');
    console.log(colors.reset);
    
    console.log(colors.green + '\n✅ Agent stopped successfully\n' + colors.reset);
    process.exit(0);
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  
  // Status updates every 5 minutes
  const statusInterval = setInterval(() => {
    if (!isShuttingDown) {
      printStatus(agent);
    }
  }, 5 * 60 * 1000);
  
  // Start research
  console.log(colors.green + '✨ Research agent starting...' + colors.reset);
  console.log(colors.white + '\nPress Ctrl+C to stop\n' + colors.reset);
  
  try {
    await agent.start();
  } catch (error) {
    console.error(colors.gold + '\n❌ Error:' + colors.reset, error);
    clearInterval(statusInterval);
    process.exit(1);
  }
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

/*
From Africa 🇿🇦, For Humanity 🌍, Unto God's Glory ✨

May this research honor God and serve humanity
*/
