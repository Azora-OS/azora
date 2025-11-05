const { ethers } = require("hardhat");
async function main() {
  const AZR = await ethers.getContractFactory("AZR");
  const azr = await AZR.deploy();
  await azr.deployed();
  console.log("AZR deployed to:", azr.address);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
