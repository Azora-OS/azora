const { ethers } = require("hardhat");

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
  
  // Deploy Ubuntu Governance
  console.log("\n🏛️ Deploying Ubuntu Governance...");
  const UbuntuGovernance = await ethers.getContractFactory("UbuntuGovernance");
  const governance = await UbuntuGovernance.deploy(azrToken.address);
  await governance.deployed();
  console.log("✅ Ubuntu Governance deployed to:", governance.address);
  
  // Setup initial configuration
  console.log("\n⚙️ Setting up Ubuntu configuration...");
  
  // Add governance as validator
  await azrToken.addUbuntuValidator(governance.address);
  console.log("✅ Governance added as Ubuntu validator");
  
  // Initial mining for deployer
  await azrToken.ubuntuMine(
    deployer.address,
    "Genesis Ubuntu Knowledge",
    100
  );
  console.log("✅ Genesis Ubuntu mining completed");
  
  console.log("\n🌟 UBUNTU BLOCKCHAIN DEPLOYMENT COMPLETE!");
  console.log("=========================================");
  console.log("AZR Token:", azrToken.address);
  console.log("Ubuntu Governance:", governance.address);
  console.log("\n'Ngiyakwazi ngoba sikwazi' - Blockchain Ubuntu activated! 🚀");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });