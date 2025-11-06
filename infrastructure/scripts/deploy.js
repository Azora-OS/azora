import hardhat from "hardhat";

async function main() {
  const [deployer] = await hardhat.ethers.getSigners();

  // Deploy AZR token first
  const AZR = await hardhat.ethers.getContractFactory("AZR");
  const azr = await AZR.deploy(deployer.address);
  await azr.deployed();

  // Deploy AzoraSavingsVault with valid addresses and values
  const apyBasisPoints = 1500; // 15% APY
  const AzoraSavingsVault = await hardhat.ethers.getContractFactory("AzoraSavingsVault");
  const vault = await AzoraSavingsVault.deploy(
    azr.address,         // IERC20Mintable _azr
    apyBasisPoints,      // uint256 _apyBasisPoints
    deployer.address     // address _governance
  );
  await vault.deployed();

  console.log("AZR deployed to:", azr.address);
  console.log("AzoraSavingsVault deployed to:", vault.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});