import { ethers } from "ethers";
import fs from "fs";

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
    // Use the private key of the wallet that has AZR (user's wallet)
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);

    const azrAddress = process.env.AZR_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const redemptionAddress = process.env.REDEMPTION_ADDRESS || "0x5fbdb2315678afecb367f032d93f642f64180aa3";

    console.log("Requesting redemption from:", signer.address);

    // Read the compiled contract artifacts
    const azrArtifact = JSON.parse(fs.readFileSync("./artifacts/contracts/MockERC20.sol/MockERC20.json", "utf8"));
    const redemptionArtifact = JSON.parse(fs.readFileSync("./artifacts/contracts/Redemption.sol/Redemption.json", "utf8"));

    // Create contract instances
    const azr = new ethers.Contract(azrAddress, azrArtifact.abi, signer);
    const redemption = new ethers.Contract(redemptionAddress, redemptionArtifact.abi, signer);

    // Approve the redemption contract to spend AZR
    const amount = ethers.parseEther("150");
    console.log("Approving", ethers.formatEther(amount), "AZR for redemption contract...");
    await azr.approve(redemptionAddress, amount);

    // Request redemption
    const bankDetails = "Test bank details - Account: 2278022268, Branch: 470010, Swift: CABLZAJJ";
    console.log("Requesting redemption for", ethers.formatEther(amount), "AZR...");
    const tx = await redemption.requestRedeem(amount, bankDetails);
    await tx.wait();

    console.log("Redemption requested successfully!");
    console.log("Transaction hash:", tx.hash);

    // Get the redemption ID (assuming it's the latest)
    const nextId = await redemption.nextRedemptionId();
    const redemptionId = nextId - 1n;
    console.log("Redemption ID:", redemptionId);

    // Get redemption details
    const details = await redemption.getRedemption(redemptionId);
    console.log("Redemption details:", {
        requester: details[0],
        amount: ethers.formatEther(details[1]),
        bankDetails: details[2],
        requestedAt: new Date(Number(details[3]) * 1000).toISOString(),
        completed: details[4]
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});