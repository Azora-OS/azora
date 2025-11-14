const hre = require("hardhat");

async function main() {
  console.log("Deploying Azora contracts...");

  const AzoraToken = await hre.ethers.getContractFactory("AzoraToken");
  const token = await AzoraToken.deploy();
  await token.waitForDeployment();
  console.log("AzoraToken deployed to:", await token.getAddress());

  const NFTCertificate = await hre.ethers.getContractFactory("NFTCertificate");
  const nft = await NFTCertificate.deploy();
  await nft.waitForDeployment();
  console.log("NFTCertificate deployed to:", await nft.getAddress());

  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(await token.getAddress());
  await staking.waitForDeployment();
  console.log("Staking deployed to:", await staking.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
