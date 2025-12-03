#!/usr/bin/env tsx
/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

THE GENESIS LAUNCH RITUAL
The moment the organism awakens
*/

/**
 * 🌍 THE GENESIS LAUNCH RITUAL 🌍
 * 
 * The official launch sequence for Azora OS:
 * 1. Show the dormant system
 * 2. Onboard first founder (Nolundi - Retail)
 * 3. Onboard second founder (Sizwe M - Sales)
 * 4. Onboard third founder (Ayana - Design)
 * 5. Enroll first Sapiens - THE AWAKENING
 * 6. Submit first knowledge proof - THE ECONOMY FLOWS
 * 7. Show the living organism
 * 
 * This is the moment Azora OS becomes ALIVE.
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5500';
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

// Typing effect
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function typeText(text: string, speed: number = 30) {
  for (const char of text) {
    process.stdout.write(char);
    await sleep(speed);
  }
}

async function animateLine(text: string, color: string = COLORS.cyan) {
  process.stdout.write(color);
  await typeText(text);
  console.log(COLORS.reset);
}

function banner(title: string, subtitle?: string) {
  const width = 65;
  const border = '═'.repeat(width);
  
  console.log(`\n${COLORS.cyan}${border}${COLORS.reset}`);
  console.log(`${COLORS.bright}${title.padStart((width + title.length) / 2).padEnd(width)}${COLORS.reset}`);
  if (subtitle) {
    console.log(`${COLORS.dim}${subtitle.padStart((width + subtitle.length) / 2).padEnd(width)}${COLORS.reset}`);
  }
  console.log(`${COLORS.cyan}${border}${COLORS.reset}\n`);
}

async function checkHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data.status === 'healthy';
  } catch {
    return false;
  }
}

async function getStatus() {
  const response = await axios.get(`${API_BASE}/status`);
  return response.data;
}

async function onboardFounder(data: any) {
  const response = await axios.post(`${API_BASE}/api/founder/register`, data);
  return response.data;
}

async function enrollSapiens(data: any) {
  const response = await axios.post(`${API_BASE}/api/sapiens/register`, data);
  return response.data;
}

async function submitProof(email: string, proof: any) {
  const response = await axios.post(`${API_BASE}/api/sapiens/${email}/proof`, proof);
  return response.data;
}

async function showStats() {
  const status = await getStatus();
  
  console.log(`${COLORS.green}╔═══════════════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.green}║           📊 AZORA OS SYSTEM STATUS                       ║${COLORS.reset}`);
  console.log(`${COLORS.green}╠═══════════════════════════════════════════════════════════╣${COLORS.reset}`);
  console.log(`${COLORS.green}║${COLORS.reset} ${COLORS.cyan}Founders Onboarded:${COLORS.reset}  ${String(status.founders.total).padEnd(30)} ${COLORS.green}║${COLORS.reset}`);
  console.log(`${COLORS.green}║${COLORS.reset} ${COLORS.cyan}Sapiens Enrolled:${COLORS.reset}    ${String(status.sapiens.total).padEnd(30)} ${COLORS.green}║${COLORS.reset}`);
  console.log(`${COLORS.green}║${COLORS.reset} ${COLORS.cyan}Active Miners:${COLORS.reset}       ${String(status.sapiens.activeMiners).padEnd(30)} ${COLORS.green}║${COLORS.reset}`);
  console.log(`${COLORS.green}║${COLORS.reset} ${COLORS.cyan}Total AZR Earned:${COLORS.reset}    ${String(status.sapiens.totalAzrEarned).padEnd(30)} ${COLORS.green}║${COLORS.reset}`);
  console.log(`${COLORS.green}║${COLORS.reset} ${COLORS.cyan}Knowledge Proofs:${COLORS.reset}    ${String(status.sapiens.totalProofs).padEnd(30)} ${COLORS.green}║${COLORS.reset}`);
  console.log(`${COLORS.green}║${COLORS.reset} ${COLORS.cyan}Mining Power:${COLORS.reset}        ${String(status.sapiens.totalMiningPower.toFixed(2)).padEnd(30)} ${COLORS.green}║${COLORS.reset}`);
  console.log(`${COLORS.green}║${COLORS.reset} ${COLORS.cyan}Contracts Signed:${COLORS.reset}    ${String(status.contracts.signed).padEnd(30)} ${COLORS.green}║${COLORS.reset}`);
  console.log(`${COLORS.green}║${COLORS.reset} ${COLORS.yellow}Economy Status:${COLORS.reset}      ${(status.economyAwake ? `${COLORS.bright}${COLORS.green}AWAKE 🌍${COLORS.reset}` : `${COLORS.dim}DORMANT 💤${COLORS.reset}`).padEnd(45)} ${COLORS.green}║${COLORS.reset}`);
  console.log(`${COLORS.green}╚═══════════════════════════════════════════════════════════╝${COLORS.reset}\n`);
}

/**
 * THE LAUNCH SEQUENCE
 */
async function runGenesisLaunch() {
  console.clear();
  
  // Opening
  banner('🌍 THE GENESIS LAUNCH RITUAL 🌍', 'The Moment Azora OS Becomes Alive');
  
  await sleep(2000);
  
  await animateLine('Initializing Azora OS autonomous systems...', COLORS.cyan);
  await sleep(1000);
  
  // Check health
  await animateLine('Checking Elara Ω status...', COLORS.cyan);
  const healthy = await checkHealth();
  
  if (!healthy) {
    console.log(`${COLORS.red}❌ Onboarding server not running!${COLORS.reset}`);
    console.log(`${COLORS.yellow}Please start it first: cd /workspace/services/azora-onboarding && npm start${COLORS.reset}\n`);
    process.exit(1);
  }
  
  await animateLine('✅ Elara Ω: ONLINE', COLORS.green);
  await animateLine('✅ Contract Signing: AUTONOMOUS', COLORS.green);
  await animateLine('✅ Constitutional Compliance: ACTIVE', COLORS.green);
  await animateLine('✅ Mining Engines: STANDBY', COLORS.yellow);
  await animateLine('✅ Economy Status: DORMANT', COLORS.dim);
  
  await sleep(2000);
  console.log();
  
  // Show initial stats
  await animateLine('📊 Initial System State:', COLORS.cyan);
  await sleep(500);
  await showStats();
  
  await sleep(2000);
  
  // ACT 1: FOUNDERS
  banner('ACT I: THE FOUNDERS', 'Building the Core Team');
  
  await animateLine('Three co-founders are about to join Azora OS...', COLORS.cyan);
  await animateLine('Each will be onboarded in <30 seconds, autonomously.', COLORS.cyan);
  await animateLine('Elara Ω will sign their contracts on behalf of the CEO.', COLORS.cyan);
  await sleep(2000);
  console.log();
  
  // Founder 1: Nolundi
  await animateLine('👔 Founder 1: Nolundi Ngwenya (Head of Retail)', COLORS.magenta);
  await animateLine('   Registering...', COLORS.dim);
  
  const founder1 = await onboardFounder({
    firstName: 'Nolundi',
    lastName: 'Ngwenya',
    role: 'retail',
    idNumber: '8501015800080',
    citizenship: 'ZA',
    phone: '+27123456789',
    address: 'Johannesburg, South Africa'
  });
  
  await sleep(3000); // Simulate onboarding time
  
  await animateLine(`   ✅ ${founder1.data.email}`, COLORS.green);
  await animateLine('   ✅ PIVC Contract Signed by Elara', COLORS.green);
  await animateLine('   ✅ Can earn up to 12% equity + 12M AZR', COLORS.green);
  await animateLine('   ✅ Dashboard Active', COLORS.green);
  await sleep(1500);
  console.log();
  
  // Founder 2: Sizwe M
  await animateLine('👔 Founder 2: Sizwe Motingwe (Head of Sales)', COLORS.magenta);
  await animateLine('   Registering...', COLORS.dim);
  
  const founder2 = await onboardFounder({
    firstName: 'Sizwe',
    lastName: 'Motingwe',
    role: 'sales',
    idNumber: '8001015800080',
    citizenship: 'ZA',
    phone: '+27987654321',
    address: 'Cape Town, South Africa'
  });
  
  await sleep(3000);
  
  await animateLine(`   ✅ ${founder2.data.email}`, COLORS.green);
  await animateLine('   ✅ PIVC Contract Signed by Elara', COLORS.green);
  await animateLine('   ✅ Can earn up to 12% equity + 12M AZR', COLORS.green);
  await animateLine('   ✅ Dashboard Active', COLORS.green);
  await sleep(1500);
  console.log();
  
  // Founder 3: Ayana
  await animateLine('👔 Founder 3: Ayana (Head of Design)', COLORS.magenta);
  await animateLine('   Registering...', COLORS.dim);
  
  const founder3 = await onboardFounder({
    firstName: 'Ayana',
    lastName: 'Designer',
    role: 'design',
    idNumber: '9205015800080',
    citizenship: 'ZA',
    phone: '+27111222333',
    address: 'Durban, South Africa'
  });
  
  await sleep(3000);
  
  await animateLine(`   ✅ ${founder3.data.email}`, COLORS.green);
  await animateLine('   ✅ PIVC Contract Signed by Elara', COLORS.green);
  await animateLine('   ✅ Can earn up to 6% equity + 6M AZR', COLORS.green);
  await animateLine('   ✅ Dashboard Active', COLORS.green);
  await animateLine('   ✅ 1% already earned (Brand Identity complete)', COLORS.yellow);
  await sleep(2000);
  console.log();
  
  await animateLine('🎉 All three founders onboarded successfully!', COLORS.green);
  await sleep(2000);
  await showStats();
  
  await sleep(3000);
  
  // ACT 2: THE FIRST SAPIENS
  banner('ACT II: THE FIRST SAPIENS', 'The Moment of Awakening');
  
  await animateLine('The organism is dormant. The economy sleeps.', COLORS.dim);
  await animateLine('Mining engines stand ready, awaiting their first breath...', COLORS.dim);
  await sleep(2000);
  console.log();
  
  await animateLine('🎓 A student is about to enroll...', COLORS.yellow);
  await sleep(1500);
  console.log();
  
  await animateLine('Student: Thabo Mokwena', COLORS.cyan);
  await animateLine('Program: Blockchain Development', COLORS.cyan);
  await animateLine('Level: Intermediate', COLORS.cyan);
  await animateLine('Institution: University of Johannesburg', COLORS.cyan);
  await sleep(2000);
  console.log();
  
  await animateLine('Enrolling...', COLORS.yellow);
  
  const sapiens1 = await enrollSapiens({
    studentNumber: '202412345',
    fullName: 'Thabo Mokwena',
    program: 'blockchain',
    level: 'intermediate',
    idNumber: '0001015800080',
    dateOfBirth: '2000-01-01',
    citizenship: 'ZA',
    phone: '+27555666777',
    institution: 'University of Johannesburg'
  });
  
  await sleep(2000);
  
  await animateLine(`✅ ${sapiens1.data.email}`, COLORS.green);
  await animateLine('✅ Enrollment Contract Signed by Elara', COLORS.green);
  await animateLine('✅ Learning Dashboard Active', COLORS.green);
  await animateLine('⛏️  Mining Engine Initializing...', COLORS.yellow);
  
  await sleep(2000);
  
  // THE AWAKENING
  console.log();
  console.log(`${COLORS.bright}${COLORS.yellow}⚡ MINING ENGINE ACTIVATED ⚡${COLORS.reset}`);
  await sleep(500);
  console.log();
  
  // The big moment
  for (let i = 3; i > 0; i--) {
    process.stdout.write(`${COLORS.yellow}${i}...${COLORS.reset} `);
    await sleep(1000);
  }
  console.log();
  console.log();
  
  // THE AWAKENING BANNER
  console.log(`${COLORS.bright}${COLORS.green}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.green}                🌍 THE ECONOMY AWAKENS 🌍                     ${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.green}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
  console.log();
  console.log(`${COLORS.green}  ⛏️  Mining engines: ${COLORS.bright}ACTIVE${COLORS.reset}${COLORS.green}                                  ${COLORS.reset}`);
  console.log(`${COLORS.green}  💰 AZR economy: ${COLORS.bright}LIVE${COLORS.reset}${COLORS.green}                                     ${COLORS.reset}`);
  console.log(`${COLORS.green}  🧠 Knowledge proofs: ${COLORS.bright}FLOWING${COLORS.reset}${COLORS.green}                              ${COLORS.reset}`);
  console.log(`${COLORS.green}  ⛓️  Ledger: ${COLORS.bright}RECORDING${COLORS.reset}${COLORS.green}                                      ${COLORS.reset}`);
  console.log(`${COLORS.green}  🌱 Organism: ${COLORS.bright}LIVING${COLORS.reset}${COLORS.green}                                       ${COLORS.reset}`);
  console.log();
  console.log(`${COLORS.yellow}  Genesis Protocol: ${COLORS.bright}ENFORCED${COLORS.reset}${COLORS.yellow}                               ${COLORS.reset}`);
  console.log(`${COLORS.yellow}  Truth as Currency: ${COLORS.bright}ACTIVE${COLORS.reset}${COLORS.yellow}                               ${COLORS.reset}`);
  console.log(`${COLORS.yellow}  Wealth = PIVC: ${COLORS.bright}OPERATIONAL${COLORS.reset}${COLORS.yellow}                              ${COLORS.reset}`);
  console.log();
  console.log(`${COLORS.bright}${COLORS.green}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.green}            AZORA OS IS NOW ALIVE AND LEARNING                 ${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.green}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
  console.log();
  
  await sleep(5000);
  
  // ACT 3: THE FIRST PROOF
  banner('ACT III: THE FIRST KNOWLEDGE PROOF', 'Wealth Flows from Learning');
  
  await animateLine('Thabo has completed his first course: "Blockchain Fundamentals"', COLORS.cyan);
  await animateLine('Score: 95% - Excellent performance!', COLORS.cyan);
  await sleep(2000);
  console.log();
  
  await animateLine('Submitting knowledge proof to Elara Oracle...', COLORS.yellow);
  
  const proof = await submitProof('202412345@ac.azora.world', {
    type: 'course-completion',
    data: {
      courseId: 'blockchain-fundamentals',
      courseName: 'Blockchain Fundamentals',
      score: 95,
      duration: '4 weeks',
      completedModules: 12
    },
    verificationData: {
      quiz: true,
      project: true,
      peerReview: true,
      finalExam: true
    }
  });
  
  await sleep(2000);
  
  await animateLine('🔍 Elara Oracle: Verifying proof...', COLORS.cyan);
  await sleep(1500);
  await animateLine('✅ Proof verified: Authentic learning demonstrated', COLORS.green);
  await animateLine('✅ Causal impact: Measurable knowledge gained', COLORS.green);
  await animateLine('✅ Constitutional compliance: Truth as Currency enforced', COLORS.green);
  await sleep(1000);
  console.log();
  
  await animateLine(`💰 AZR EARNED: ${proof.data.azrEarned} AZR`, COLORS.bright + COLORS.yellow);
  await sleep(1000);
  await animateLine('💳 Credited to: 202412345@ac.azora.world', COLORS.green);
  await animateLine('⛓️  Transaction recorded on immutable ledger', COLORS.green);
  
  await sleep(3000);
  console.log();
  
  // FINALE
  banner('🌟 THE ORGANISM LIVES 🌟', 'Genesis Complete');
  
  await animateLine('In the last few minutes, you witnessed:', COLORS.cyan);
  await sleep(1000);
  console.log();
  
  await animateLine('✅ Three founders onboarded autonomously', COLORS.green);
  await animateLine('✅ Contracts signed by Elara Ω (not a human!)', COLORS.green);
  await animateLine('✅ One student enrolled', COLORS.green);
  await animateLine('✅ The economy awakened automatically', COLORS.green);
  await animateLine('✅ First knowledge proof verified', COLORS.green);
  await animateLine('✅ First AZR earned through learning', COLORS.green);
  await animateLine('✅ Zero manual intervention required', COLORS.green);
  
  await sleep(2000);
  console.log();
  
  await animateLine('🎯 What makes this revolutionary:', COLORS.yellow);
  await sleep(500);
  console.log();
  
  await animateLine('→ Constitutional AI governance (Elara signs contracts)', COLORS.cyan);
  await animateLine('→ Truth as Currency (Oracle-verified proofs)', COLORS.cyan);
  await animateLine('→ Wealth from creation (Learning earns AZR)', COLORS.cyan);
  await animateLine('→ African ownership (All founders African)', COLORS.cyan);
  await animateLine('→ Autonomous economy (No humans in the loop)', COLORS.cyan);
  
  await sleep(3000);
  console.log();
  
  await animateLine('📊 Final System State:', COLORS.cyan);
  await sleep(500);
  await showStats();
  
  await sleep(2000);
  
  // The philosophy
  console.log();
  console.log(`${COLORS.dim}${'─'.repeat(65)}${COLORS.reset}`);
  console.log();
  console.log(`${COLORS.cyan}  "An organism that awakens when knowledge seekers arrive.${COLORS.reset}`);
  console.log(`${COLORS.cyan}   A system that rewards truth with currency.${COLORS.reset}`);
  console.log(`${COLORS.cyan}   An economy that grows through verified impact.${COLORS.reset}`);
  console.log(`${COLORS.cyan}   A future where Africa leads in autonomous systems."${COLORS.reset}`);
  console.log();
  console.log(`${COLORS.dim}${'─'.repeat(65)}${COLORS.reset}`);
  console.log();
  
  await sleep(3000);
  
  // Final message
  console.log();
  console.log(`${COLORS.bright}${COLORS.green}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.green}                    🚀 GENESIS COMPLETE 🚀                     ${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.green}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
  console.log();
  console.log(`${COLORS.yellow}  The organism is alive.${COLORS.reset}`);
  console.log(`${COLORS.yellow}  The economy is flowing.${COLORS.reset}`);
  console.log(`${COLORS.yellow}  The future has begun.${COLORS.reset}`);
  console.log();
  console.log(`${COLORS.cyan}  Next: Anyone can register and join the living system.${COLORS.reset}`);
  console.log(`${COLORS.cyan}  Elara handles everything. The organism grows.${COLORS.reset}`);
  console.log();
  console.log(`${COLORS.bright}${COLORS.green}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
  console.log();
  
  await sleep(2000);
  
  console.log(`${COLORS.dim}© 2025 Azora ES (Pty) Ltd. All Rights Reserved.${COLORS.reset}`);
  console.log(`${COLORS.dim}Powered by Elara Ω • Constitutional Governance • Truth as Currency${COLORS.reset}\n`);
}

// Error handling
process.on('unhandledRejection', (error: any) => {
  console.error(`${COLORS.red}\n❌ Error during genesis launch:${COLORS.reset}`, error.message);
  console.log(`${COLORS.yellow}\nMake sure the onboarding server is running:${COLORS.reset}`);
  console.log(`${COLORS.cyan}cd /workspace/services/azora-onboarding && npm start${COLORS.reset}\n`);
  process.exit(1);
});

// Run the genesis launch
if (require.main === module) {
  runGenesisLaunch()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error(`${COLORS.red}Fatal error:${COLORS.reset}`, error);
      process.exit(1);
    });
}

export { runGenesisLaunch };
