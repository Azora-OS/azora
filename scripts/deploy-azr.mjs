import { ethers } from "ethers";
import fs from "fs";

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.AZORA_RPC_URL || "http://localhost:8545");
    const signer = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

    console.log("Deploying MockERC20 (AZR) token");

    // Read the compiled contract artifact
    const artifactPath = "./artifacts/contracts/MockERC20.sol/MockERC20.json";
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Create contract factory
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

    // Deploy the contract with name "Azora", symbol "AZR", initial supply 1000000
    const initialSupply = ethers.parseEther("1000000");
    const azr = await factory.deploy("Azora", "AZR", initialSupply);
    await azr.waitForDeployment();

    console.log("AZR deployed to:", await azr.getAddress());
    console.log("IMPORTANT: Set AZR_ADDRESS in your environment to this address.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});