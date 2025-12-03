/**
 * DIRECT DEPLOYMENT - NO HARDHAT DEPENDENCY
 *
 * Deploys Azora system directly using ethers.js without hardhat complications
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 DIRECT AZORA DEPLOYMENT - BYPASSING HARDHAT ISSUES");
    console.log("=".repeat(60));

    // Configuration
    const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
    const RPC_URL = process.env.AZORA_RPC_URL || "http://127.0.0.1:8545";

    if (!PRIVATE_KEY) {
        console.error("❌ Missing BLOCKCHAIN_PRIVATE_KEY in .env");
        process.exit(1);
    }

    // Connect to provider
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const deployer = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`Deployer: ${deployer.address}`);
    console.log(`RPC: ${RPC_URL}`);

    const balance = await provider.getBalance(deployer.address);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

    // Load contract artifacts
    const loadContract = (name) => {
        const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'quantum-secure', `${name}.sol`, `${name}.json`);
        return JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    };

    // Deploy contracts
    console.log("\n🏗️  DEPLOYING CONTRACTS...");

    // 1. Deploy AzoraMasterSystem
    console.log("⏳ Deploying AzoraMasterSystem...");
    const masterArtifact = loadContract('AzoraMasterSystem');
    const masterFactory = new ethers.ContractFactory(masterArtifact.abi, masterArtifact.bytecode, deployer);

    const guardians = [
        "0x742d35Cc6634C0532925a3b8F4f3e9C8F3e9C8F3", // Guardian 1
        "0x742d35Cc6634C0532925a3b8F4f3e9C8F3e9C8F4", // Guardian 2
        "0x742d35Cc6634C0532925a3b8F4f3e9C8F3e9C8F5", // Guardian 3
        ethers.Wallet.createRandom().address, // Random guardians for testing
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
    ];

    const masterContract = await masterFactory.deploy(guardians, deployer.address, deployer.address);
    await masterContract.waitForDeployment();
    const masterAddress = await masterContract.getAddress();
    console.log(`✅ AzoraMasterSystem: ${masterAddress}`);

    // Get deployed component addresses
    const azrTokenAddress = await masterContract.azrToken();
    const causalLedgerAddress = await masterContract.causalLedger();
    const consensusAddress = await masterContract.consensus();
    const forgeMiningAddress = await masterContract.forgeMining();
    const marketOracleAddress = await masterContract.marketOracle();

    console.log(`   AZR Token: ${azrTokenAddress}`);
    console.log(`   Causal Ledger: ${causalLedgerAddress}`);
    console.log(`   Consensus: ${consensusAddress}`);
    console.log(`   Forge Mining: ${forgeMiningAddress}`);
    console.log(`   Market Oracle: ${marketOracleAddress}`);

    // 2. Deploy BootstrapValueSystem
    console.log("⏳ Deploying BootstrapValueSystem...");
    const bootstrapArtifact = loadContract('BootstrapValueSystem');
    const bootstrapFactory = new ethers.ContractFactory(bootstrapArtifact.abi, bootstrapArtifact.bytecode, deployer);

    const bootstrapContract = await bootstrapFactory.deploy(
        masterAddress,
        azrTokenAddress,
        forgeMiningAddress,
        deployer.address
    );
    await bootstrapContract.waitForDeployment();
    const bootstrapAddress = await bootstrapContract.getAddress();
    console.log(`✅ BootstrapValueSystem: ${bootstrapAddress}`);

    // 3. Deploy AdvancedWithdrawalSystem
    console.log("⏳ Deploying AdvancedWithdrawalSystem...");
    const withdrawalArtifact = loadContract('AdvancedWithdrawalSystem');
    const withdrawalFactory = new ethers.ContractFactory(withdrawalArtifact.abi, withdrawalArtifact.bytecode, deployer);

    const withdrawalContract = await withdrawalFactory.deploy(
        azrTokenAddress,
        bootstrapAddress
    );
    await withdrawalContract.waitForDeployment();
    const withdrawalAddress = await withdrawalContract.getAddress();
    console.log(`✅ AdvancedWithdrawalSystem: ${withdrawalAddress}`);

    // 4. Bootstrap the system
    console.log("\n💰 BOOTSTRAPPING SYSTEM...");
    console.log("⏳ Bootstrapping with real value...");
    const bootstrapTx = await bootstrapContract.bootstrapSystem();
    await bootstrapTx.wait();
    console.log("✅ System bootstrapped!");

    // 5. Issue founder loan
    console.log("⏳ Issuing founder loan...");
    const loanTx = await bootstrapContract.issueFounderLoan(ethers.parseEther("10000"), 365);
    await loanTx.wait();
    console.log("✅ Founder loan issued: 10,000 AZR");

    // 6. Extract business value
    console.log("⏳ Extracting business value for platform fees...");
    const extractTx = await bootstrapContract.extractValueForBusinessGrowth(ethers.parseEther("2000"));
    await extractTx.wait();
    console.log("✅ Business value extracted: 2,000 AZR");

    // 7. Generate daily value
    console.log("⏳ Generating guaranteed daily value...");
    const valueTx = await bootstrapContract.generateDailyGuaranteedValue();
    await valueTx.wait();
    console.log("✅ Daily value generated: 1,000 AZR");

    // 8. Test withdrawal
    console.log("⏳ Testing loan-backed withdrawal...");
    const withdrawTx = await withdrawalContract.requestWithdrawal(
        ethers.parseEther("1000"),
        3, // LOAN_BACKED
        "",
        "AZR"
    );
    await withdrawTx.wait();
    console.log("✅ Withdrawal successful: 1,000 AZR (0% fee)");

    // Final status
    console.log("\n📈 FINAL STATUS");
    const finalBootstrap = await bootstrapContract.getBootstrapStatus();
    const founderLoan = await bootstrapContract.getFounderLoanInfo(deployer.address);

    console.log(`   Bootstrapped Value: $${ethers.formatEther(finalBootstrap.totalValue)}`);
    console.log(`   Guaranteed Generated: $${ethers.formatEther(finalBootstrap.guaranteedGenerated)}`);
    console.log(`   Founder Loan: ${ethers.formatEther(founderLoan.amount)} AZR`);
    console.log(`   Available: ${ethers.formatEther(founderLoan.amount - founderLoan.paidBack)} AZR`);

    // Save addresses to file
    const addresses = {
        masterSystem: masterAddress,
        azrToken: azrTokenAddress,
        bootstrapSystem: bootstrapAddress,
        withdrawalSystem: withdrawalAddress,
        causalLedger: causalLedgerAddress,
        consensus: consensusAddress,
        forgeMining: forgeMiningAddress,
        marketOracle: marketOracleAddress,
        timestamp: new Date().toISOString(),
        founder: deployer.address
    };

    fs.writeFileSync('deployed-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("📄 Addresses saved to deployed-addresses.json");

    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("💰 BUSINESS FUNDING SECURED!");
    console.log(`💰 Available: $${ethers.formatEther(founderLoan.amount - founderLoan.paidBack)}`);
    console.log("🔄 System ready for daily value generation");

    console.log("\n📋 CONTRACT ADDRESSES:");
    Object.entries(addresses).forEach(([key, value]) => {
        if (key !== 'timestamp' && key !== 'founder') {
            console.log(`   ${key}: ${value}`);
        }
    });
}

// Error handling
main().catch((error) => {
    console.error("❌ DEPLOYMENT FAILED:");
    console.error(error);
    process.exit(1);
});
