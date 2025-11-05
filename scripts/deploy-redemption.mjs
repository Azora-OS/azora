// Example Hardhat deploy script for Redemption contract (testAmount 150 AZR)
// Usage: set env vars RPC_URL, PRIVATE_KEY, AZR_ADDRESS, GNOSIS_SAFE_ADDRESS
// then run: npx hardhat run --network localhost scripts/deploy-redemption.mjs

import { ethers } from "ethers";
import fs from "fs";

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.AZORA_RPC_URL || "http://localhost:8545");
    const signer = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

    const azrAddress = process.env.AZR_ADDRESS || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    const admin = process.env.GNOSIS_SAFE_ADDRESS || "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

    console.log("Deploying Redemption with AZR:", azrAddress, "admin:", admin);

    // Read the compiled contract artifact
    const artifactPath = "./artifacts/contracts/Redemption.sol/Redemption.json";
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Create contract factory
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

    // Deploy the contract
    const redemption = await factory.deploy(azrAddress, admin);
    await redemption.waitForDeployment();

    console.log("Redemption deployed to:", await redemption.getAddress());
    console.log("IMPORTANT: Set REDEMPTION_ADDRESS in your offchain worker and update the Ops payout confirmation.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});