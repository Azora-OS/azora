import { ethers } from "ethers";
import fs from "fs";

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.AZORA_RPC_URL || "http://localhost:8545");
    // Use the private key of account #1 (the wallet with 150 AZR)
    const signer = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);

    const azrAddress = process.env.AZR_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const toAddress = process.env.TO_ADDRESS || "0x39f8b51367e3528dab7c2256ddcff01b1fde05d0";

    console.log("Transferring 150 AZR from", signer.address, "to", toAddress);

    // Read the compiled contract artifact for MockERC20
    const artifactPath = "./artifacts/contracts/MockERC20.sol/MockERC20.json";
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Create contract instance
    const azr = new ethers.Contract(azrAddress, artifact.abi, signer);

    // Transfer 150 AZR (150 * 10^18)
    const amount = ethers.parseEther("150");
    await azr.transfer(toAddress, amount);

    console.log("Transferred 150 AZR to", toAddress);

    // Check balance of recipient
    const balance = await azr.balanceOf(toAddress);
    console.log("Balance of", toAddress, ":", ethers.formatEther(balance), "AZR");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});