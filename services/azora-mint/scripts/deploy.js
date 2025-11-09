/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy KYC
  const KYC = await hre.ethers.getContractFactory("KYC");
  const kyc = await KYC.deploy();
  await kyc.deployed();
  console.log("KYC deployed to:", kyc.address);

  // Deploy AZR
  const AZR = await hre.ethers.getContractFactory("AZR");
  const azr = await AZR.deploy(kyc.address);
  await azr.deployed();
  console.log("AZR deployed to:", azr.address);

  // Deploy AzoraDID
  const AzoraDID = await hre.ethers.getContractFactory("AzoraDID");
  const did = await AzoraDID.deploy();
  await did.deployed();
  console.log("AzoraDID deployed to:", did.address);

  // Deploy AzoraNFT
  const AzoraNFT = await hre.ethers.getContractFactory("AzoraNFT");
  const nft = await AzoraNFT.deploy(deployer.address); // treasury = deployer
  await nft.deployed();
  console.log("AzoraNFT deployed to:", nft.address);

  // Verify contracts
  await hre.run("verify:verify", { address: kyc.address });
  await hre.run("verify:verify", { address: azr.address, constructorArguments: [kyc.address] });
  await hre.run("verify:verify", { address: did.address });
  await hre.run("verify:verify", { address: nft.address, constructorArguments: [deployer.address] });
}

main().catch(console.error);
