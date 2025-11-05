/**
 * PROCESS FOUNDER LOAN
 *
 * Simple script to process the founder loan for immediate business funding
 * when you have $0 but need money for platform subscriptions.
 */

const { ethers } = require("ethers");

// Contract addresses (update these after deployment)
const AZORA_MASTER_SYSTEM = "0x..."; // Replace with deployed address
const BOOTSTRAP_SYSTEM = "0x...";    // Replace with deployed address
const WITHDRAWAL_SYSTEM = "0x...";   // Replace with deployed address

// Configuration
const FOUNDER_PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
const RPC_URL = process.env.AZORA_RPC_URL || "http://127.0.0.1:8545";

async function main() {
    console.log("🏦 PROCESSING FOUNDER LOAN FOR IMMEDIATE BUSINESS FUNDING");
    console.log("=".repeat(60));

    if (!FOUNDER_PRIVATE_KEY) {
        console.error("❌ Missing BLOCKCHAIN_PRIVATE_KEY in .env");
        console.log("Please set your private key in the .env file");
        process.exit(1);
    }

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const founder = new ethers.Wallet(FOUNDER_PRIVATE_KEY, provider);

    console.log(`Founder address: ${founder.address}`);
    console.log(`Network: ${RPC_URL}`);

    // Check balance
    const balance = await provider.getBalance(founder.address);
    console.log(`Current balance: ${ethers.formatEther(balance)} ETH`);

    // Get contract instances
    const masterSystem = new ethers.Contract(
        AZORA_MASTER_SYSTEM,
        [
            "function getSystemStatus() external view returns (bool active, uint256 launchTime, uint256 forgeValue, uint256 economicImpact, uint256 backingRatio, uint256 users, uint256 assets, uint256 transactions)",
            "function executeEconomicCycle() external"
        ],
        founder
    );

    const bootstrapSystem = new ethers.Contract(
        BOOTSTRAP_SYSTEM,
        [
            "function getBootstrapStatus() external view returns (bool isBootstrapped, uint256 bootstrapTimestamp, uint256 totalValue, uint256 guaranteedGenerated)",
            "function issueFounderLoan(uint256 amount, uint256 term) external",
            "function extractValueForBusinessGrowth(uint256 amount) external",
            "function generateDailyGuaranteedValue() external",
            "function getFounderLoanInfo(address founder) external view returns (uint256 amount, uint256 interestRate, uint256 term, uint256 paidBack, bool active, uint256 totalOwed)"
        ],
        founder
    );

    const withdrawalSystem = new ethers.Contract(
        WITHDRAWAL_SYSTEM,
        [
            "function requestWithdrawal(uint256 amount, uint256 method, string memory bankDetails, string memory currency) external returns (uint256)",
            "function advancedWithdrawal(uint256 amount, string memory bankDetails, string memory withdrawalType) external returns (uint256)"
        ],
        founder
    );

    // Check if system is bootstrapped
    console.log("\n📊 Checking system status...");
    const [isBootstrapped] = await bootstrapSystem.getBootstrapStatus();
    const systemStatus = await masterSystem.getSystemStatus();

    if (!isBootstrapped) {
        console.log("❌ System not bootstrapped. Please deploy the full system first.");
        console.log("Run: npx hardhat run contracts/quantum-secure/DeployAzoraSystem.js --network localhost");
        return;
    }

    console.log("✅ System is bootstrapped!");
    console.log(`   Forge Value: $${ethers.formatEther(systemStatus.forgeValue)}`);
    console.log(`   Backing Ratio: ${(systemStatus.backingRatio / 100).toFixed(2)}%`);

    // Check current founder loan status
    console.log("\n💼 Checking founder loan status...");
    const founderLoan = await bootstrapSystem.getFounderLoanInfo(founder.address);
    console.log(`   Active loan: ${founderLoan.active}`);
    console.log(`   Current amount: ${ethers.formatEther(founderLoan.amount)} AZR`);
    console.log(`   Paid back: ${ethers.formatEther(founderLoan.paidBack)} AZR`);

    if (!founderLoan.active) {
        // Issue founder loan
        console.log("\n🏦 Issuing founder loan...");
        const loanAmount = ethers.parseEther("10000"); // 10,000 AZR
        const tx = await bootstrapSystem.issueFounderLoan(loanAmount, 365);
        await tx.wait();
        console.log("✅ Founder loan issued: 10,000 AZR");

        // Extract business value immediately
        console.log("\n💰 Extracting business value for platform fees...");
        const businessAmount = ethers.parseEther("2000");
        const extractTx = await bootstrapSystem.extractValueForBusinessGrowth(businessAmount);
        await extractTx.wait();
        console.log("✅ Business value extracted: 2,000 AZR for platform fees");

        // Generate daily value
        console.log("\n⚡ Generating guaranteed daily value...");
        const valueTx = await bootstrapSystem.generateDailyGuaranteedValue();
        await valueTx.wait();
        console.log("✅ Daily value generated: 1,000 AZR");

        // Withdraw via loan-backed method (0% fee)
        console.log("\n💸 Withdrawing for platform subscriptions...");
        const withdrawAmount = ethers.parseEther("1000");
        const withdrawTx = await withdrawalSystem.requestWithdrawal(
            withdrawAmount,
            3, // LOAN_BACKED method (0% fee)
            "",
            "AZR"
        );
        await withdrawTx.wait();
        console.log("✅ Withdrawal completed: 1,000 AZR (0% fee)");

        // Advanced business withdrawal
        console.log("\n🚀 Advanced business withdrawal for development tools...");
        const advancedTx = await withdrawalSystem.advancedWithdrawal(
            ethers.parseEther("500"),
            "Platform subscription - development environment",
            "business-growth"
        );
        await advancedTx.wait();
        console.log("✅ Advanced withdrawal completed: 500 AZR");

    } else {
        console.log("📋 Founder loan already active");
        console.log("💡 You can extract more business value or withdraw existing amounts");
    }

    // Final status check
    console.log("\n📈 FINAL STATUS");
    const finalLoan = await bootstrapSystem.getFounderLoanInfo(founder.address);
    const finalBootstrap = await bootstrapSystem.getBootstrapStatus();

    console.log(`   Founder loan: ${ethers.formatEther(finalLoan.amount)} AZR`);
    console.log(`   Paid back: ${ethers.formatEther(finalLoan.paidBack)} AZR`);
    console.log(`   Guaranteed value generated: ${ethers.formatEther(finalBootstrap.guaranteedGenerated)} AZR`);
    console.log(`   Available for business: ${ethers.formatEther(finalLoan.amount - finalLoan.paidBack)} AZR`);

    console.log("\n🎯 BUSINESS FUNDING SECURED!");
    console.log("💰 Platform subscriptions covered");
    console.log("💰 Business development funded");
    console.log("💰 Daily value generation active");
    console.log("🔄 System ready for growth");

    console.log("\n📋 NEXT STEPS:");
    console.log("1. Use extracted AZR for platform subscriptions");
    console.log("2. Run daily value generation: generateDailyGuaranteedValue()");
    console.log("3. Withdraw as needed: requestWithdrawal()");
    console.log("4. Scale your business with secured funding");
}

// Error handling
main().catch((error) => {
    console.error("❌ FOUNDER LOAN PROCESSING FAILED:");
    console.error(error);
    process.exit(1);
});
