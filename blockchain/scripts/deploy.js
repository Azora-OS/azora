const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 DEPLOYING UBUNTU BLOCKCHAIN INFRASTRUCTURE");
  console.log("============================================\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  // Deploy AZR Token
  console.log("\n💰 Deploying AZR Token...");
  const AZRToken = await ethers.getContractFactory("AZRToken");
  const azrToken = await AZRToken.deploy();
  await azrToken.deployed();
  console.log("✅ AZR Token deployed to:", azrToken.address);
  
  // Deploy CitadelFund
  console.log("\n🏦 Deploying CitadelFund...");
  const CitadelFund = await ethers.getContractFactory("CitadelFund");
  const citadelFund = await CitadelFund.deploy(azrToken.address);
  await citadelFund.deployed();
  console.log("✅ CitadelFund deployed to:", citadelFund.address);
  
  // Deploy ProofOfValue
  console.log("\n⛏️ Deploying ProofOfValue...");
  const ProofOfValue = await ethers.getContractFactory("ProofOfValue");
  const proofOfValue = await ProofOfValue.deploy(azrToken.address);
  await proofOfValue.deployed();
  console.log("✅ ProofOfValue deployed to:", proofOfValue.address);
  
  // Deploy AzoraNFT
  console.log("\n🎓 Deploying AzoraNFT...");
  const AzoraNFT = await ethers.getContractFactory("AzoraNFT");
  const azoraNFT = await AzoraNFT.deploy();
  await azoraNFT.deployed();
  console.log("✅ AzoraNFT deployed to:", azoraNFT.address);
  
  // Deploy Ubuntu Governance
  console.log("\n🏛️ Deploying Ubuntu Governance...");
  const UbuntuGovernance = await ethers.getContractFactory("UbuntuGovernance");
  const governance = await UbuntuGovernance.deploy(azrToken.address);
  await governance.deployed();
  console.log("✅ Ubuntu Governance deployed to:", governance.address);
  
  // Setup initial configuration
  console.log("\n⚙️ Setting up Ubuntu configuration...");
  
  await azrToken.addUbuntuValidator(governance.address);
  await azrToken.addUbuntuValidator(proofOfValue.address);
  await azrToken.addUbuntuValidator(deployer.address);
  console.log("✅ Validators configured");
  
  await azoraNFT.addMinter(deployer.address);
  console.log("✅ NFT minters configured");
  
  await azrToken.ubuntuMine(deployer.address, "Genesis Ubuntu Knowledge", 100);
  console.log("✅ Genesis mining completed");

  // Example batch allocations (replace with real addresses as needed)
  console.log("\n🔧 Performing example allocations (edit deploy.js to set actual country addresses)");
  const allocAccounts = [deployer.address, citadelFund.address];
  const allocAmounts = [ethers.utils.parseEther('1000000'), ethers.utils.parseEther('5000000')]; // 1M to deployer, 5M to citadel
  await azrToken.batchAllocate(allocAccounts, allocAmounts, 'Initial deployment allocation');
  console.log('✅ Example batch allocation completed');
  
  // Save deployment addresses
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      AZRToken: azrToken.address,
      CitadelFund: citadelFund.address,
      ProofOfValue: proofOfValue.address,
      AzoraNFT: azoraNFT.address,
      UbuntuGovernance: governance.address
    },
    timestamp: new Date().toISOString()
  };
  
  const deploymentPath = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log("\n📝 Deployment addresses saved to deployments.json");
  
  console.log("\n🌟 UBUNTU BLOCKCHAIN DEPLOYMENT COMPLETE!");
  console.log("=========================================");
  console.log("AZR Token:", azrToken.address);
  console.log("CitadelFund:", citadelFund.address);
  console.log("ProofOfValue:", proofOfValue.address);
  console.log("AzoraNFT:", azoraNFT.address);
  console.log("Ubuntu Governance:", governance.address);
  // Set liquidity pool to deployer by default (replace with a dedicated liquidity address)
  try {
    await azrToken.setLiquidityPool(deployer.address);
    console.log('✅ Liquidity pool set to deployer (replace with dedicated LP address)');
  } catch (err) {
    console.warn('⚠️ Setting liquidity pool failed (maybe older contract):', err.message || err);
  }
  console.log("\n'Ngiyakwazi ngoba sikwazi' - Blockchain Ubuntu activated! 🚀");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });