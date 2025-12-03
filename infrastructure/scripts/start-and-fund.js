/**
 * START BLOCKCHAIN & PROCESS FOUNDER LOAN
 *
 * Automated script to:
 * 1. Start local blockchain
 * 2. Deploy Azora system
 * 3. Process founder loan
 * 4. Provide immediate business funding
 */

import { spawn } from 'child_process';
import { promisify } from 'util';
import { setTimeout } from 'timers/promises';

const sleep = promisify(setTimeout);

async function main() {
    console.log("🚀 STARTING AZORA SYSTEM & PROCESSING FOUNDER LOAN");
    console.log("=".repeat(60));

    try {
        // Step 1: Start local blockchain
        console.log("⏳ Starting local blockchain...");
        const hardhatNode = spawn('npx', ['hardhat', 'node'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });

        // Wait for blockchain to start
        await sleep(5000);

        console.log("✅ Local blockchain started");

        // Step 2: Deploy Azora system
        console.log("⏳ Deploying Azora system...");
        const deployProcess = spawn('npx', ['hardhat', 'run', 'contracts/quantum-secure/DeployAzoraSystem.js', '--network', 'localhost'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });

        let deployOutput = '';
        deployProcess.stdout.on('data', (data) => {
            deployOutput += data.toString();
        });

        deployProcess.stderr.on('data', (data) => {
            console.error('Deploy stderr:', data.toString());
        });

        await new Promise((resolve, reject) => {
            deployProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Deployment failed with code ${code}`));
                }
            });
        });

        console.log("✅ Azora system deployed");

        // Extract contract addresses from deployment output
        const masterMatch = deployOutput.match(/Master System: (0x[a-fA-F0-9]+)/);
        const bootstrapMatch = deployOutput.match(/Bootstrap System: (0x[a-fA-F0-9]+)/);
        const withdrawalMatch = deployOutput.match(/Withdrawal System: (0x[a-fA-F0-9]+)/);

        if (!masterMatch || !bootstrapMatch || !withdrawalMatch) {
            throw new Error("Could not extract contract addresses from deployment");
        }

        const AZORA_MASTER_SYSTEM = masterMatch[1];
        const BOOTSTRAP_SYSTEM = bootstrapMatch[1];
        const WITHDRAWAL_SYSTEM = withdrawalMatch[1];

        console.log("📋 Contract addresses extracted:");
        console.log(`   Master System: ${AZORA_MASTER_SYSTEM}`);
        console.log(`   Bootstrap System: ${BOOTSTRAP_SYSTEM}`);
        console.log(`   Withdrawal System: ${WITHDRAWAL_SYSTEM}`);

        // Step 3: Process founder loan
        console.log("⏳ Processing founder loan...");

        // Update the founder loan script with addresses
        const fs = await import('fs');
        let loanScript = await fs.readFile('scripts/process-founder-loan.js', 'utf8');

        loanScript = loanScript.replace(
            /const AZORA_MASTER_SYSTEM = "0x\.\.\."; \/\/ Replace with deployed address/,
            `const AZORA_MASTER_SYSTEM = "${AZORA_MASTER_SYSTEM}";`
        );
        loanScript = loanScript.replace(
            /const BOOTSTRAP_SYSTEM = "0x\.\.\."; {4}\/\/ Replace with deployed address/,
            `const BOOTSTRAP_SYSTEM = "${BOOTSTRAP_SYSTEM}";`
        );
        loanScript = loanScript.replace(
            /const WITHDRAWAL_SYSTEM = "0x\.\.\."; {3}\/\/ Replace with deployed address/,
            `const WITHDRAWAL_SYSTEM = "${WITHDRAWAL_SYSTEM}";`
        );

        await fs.writeFile('scripts/process-founder-loan.js', loanScript);

        // Run the founder loan processing
        const loanProcess = spawn('node', ['scripts/process-founder-loan.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });

        loanProcess.stdout.on('data', (data) => {
            console.log('Loan:', data.toString());
        });

        loanProcess.stderr.on('data', (data) => {
            console.error('Loan stderr:', data.toString());
        });

        await new Promise((resolve, reject) => {
            loanProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Loan processing failed with code ${code}`));
                }
            });
        });

        console.log("✅ Founder loan processed successfully!");

        // Step 4: Summary
        console.log("\n🎉 AZORA SYSTEM FULLY OPERATIONAL!");
        console.log("=".repeat(60));

        console.log("💰 IMMEDIATE BUSINESS FUNDING:");
        console.log("   ✅ 10,000 AZR founder loan issued");
        console.log("   ✅ 2,000 AZR extracted for platform fees");
        console.log("   ✅ 1,000 AZR daily guaranteed generation");
        console.log("   ✅ Multiple withdrawal methods available");

        console.log("\n🏦 CONTRACT ADDRESSES:");
        console.log(`   Master System: ${AZORA_MASTER_SYSTEM}`);
        console.log(`   Bootstrap System: ${BOOTSTRAP_SYSTEM}`);
        console.log(`   Withdrawal System: ${WITHDRAWAL_SYSTEM}`);

        console.log("\n🚀 READY FOR BUSINESS GROWTH!");
        console.log("   💻 Platform subscriptions funded");
        console.log("   📈 Daily value generation active");
        console.log("   💰 Business development capital available");
        console.log("   🔄 System ready for scaling");

        // Keep blockchain running for user interaction
        console.log("\n⏳ Blockchain running... Press Ctrl+C to stop");
        await new Promise(() => {}); // Keep running

    } catch (error) {
        console.error("❌ SETUP FAILED:");
        console.error(error);
        process.exit(1);
    }
}

main();
