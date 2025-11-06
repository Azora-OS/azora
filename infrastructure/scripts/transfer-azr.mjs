import { ethers } from "ethers";
import fs from "fs";

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.AZORA_RPC_URL || "http://localhost:8545");
    const signer = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

    const azrAddress = process.env.AZR_ADDRESS || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    const userWallet = process.env.USER_WALLET || "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"; // account #1

    console.log("Transferring 150 AZR to:", userWallet);

    // Read the compiled contract artifact for MockERC20
    const artifactPath = "./artifacts/contracts/MockERC20.sol/MockERC20.json";
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Create contract instance
    const azr = new ethers.Contract(azrAddress, artifact.abi, signer);

    // Mint 150 AZR (150 * 10^18)
    const amount = ethers.parseEther("150");
    await azr.mint(userWallet, amount);

    console.log("Minted 150 AZR to", userWallet);

    // Check balance
    const balance = await azr.balanceOf(userWallet);
    console.log("Balance of", userWallet, ":", ethers.formatEther(balance), "AZR");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});