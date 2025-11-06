import { ethers } from "ethers";
import fs from "fs";

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
    // Use the admin private key (account #0)
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

    const redemptionAddress = process.env.REDEMPTION_ADDRESS || "0x5fbdb2315678afecb367f032d93f642f64180aa3";
    const treasuryAddress = process.env.TREASURY_ADDRESS || "0x39f8b51367e3528dab7c2256ddcff01b1fde05d0";
    const redemptionId = process.env.REDEMPTION_ID || "1";

    console.log("Completing redemption ID:", redemptionId, "to treasury:", treasuryAddress);

    // Read the compiled contract artifact
    const redemptionArtifact = JSON.parse(fs.readFileSync("./artifacts/contracts/Redemption.sol/Redemption.json", "utf8"));

    // Create contract instance
    const redemption = new ethers.Contract(redemptionAddress, redemptionArtifact.abi, signer);

    // Complete redemption
    const bankRef = "BANK-REF-TEST-001";
    console.log("Completing redemption with bank reference:", bankRef);
    const tx = await redemption.completeRedeem(redemptionId, treasuryAddress, bankRef);
    await tx.wait();

    console.log("Redemption completed successfully!");
    console.log("Transaction hash:", tx.hash);

    // Get redemption details
    const details = await redemption.getRedemption(redemptionId);
    console.log("Updated redemption details:", {
        requester: details[0],
        amount: ethers.formatEther(details[1]),
        bankDetails: details[2],
        requestedAt: new Date(Number(details[3]) * 1000).toISOString(),
        completed: details[4],
        bankRef: details[5],
        completedTreasury: details[6]
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});