import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import hardhat from "hardhat";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const azrAbi = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts/contracts/AZR.sol/AZR.json'))).abi;
const azrAddress = process.env.AZR_CONTRACT_ADDRESS;
const contract = new ethers.Contract(azrAddress, azrAbi, wallet);

async function mint50KAZR() {
  try {
    const amount = ethers.parseEther('50000'); // 50,000 AZR
    const tx = await contract.mint(process.env.CEO_ADDRESS, amount);
    const receipt = await tx.wait();
    console.log('Minted 50,000 AZR to founder address:', receipt.hash);
  } catch (err) {
    console.error('Mint failed:', err.message);
  }
}

mint50KAZR();

async function main() {
  const [owner] = await hardhat.ethers.getSigners();
  console.log("Owner address:", owner.address);

  const azrAddress = process.env.AZR_CONTRACT_ADDRESS;
  const founderAddress = process.env.CEO_ADDRESS;

  console.log("AZR Address:", azrAddress);
  console.log("Founder Address:", founderAddress);

  const AZR = await hardhat.ethers.getContractAt("AZR", azrAddress);
  const amount = hardhat.ethers.utils.parseUnits("50000", 18); // 50,000 AZR

  console.log("Minting 50,000 AZR...");
  const tx = await AZR.mint(founderAddress, amount);
  await tx.wait();

  console.log(`Minted 50,000 AZR to founder: ${founderAddress}`);
  const balance = await AZR.balanceOf(founderAddress);
  console.log(`Balance of founder: ${balance.toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});