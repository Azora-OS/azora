import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Starting Azora OS Smart Contract Deployment...");

    const nft = await NFTCertificate.deploy();
    await nft.deployed();
    console.log("✅ NFT Certificate deployed to:", nft.address);

    // 3. Deploy CitadelFund
    console.log("\n3️⃣  Deploying CitadelFund Treasury...");
    const CitadelFund = await ethers.getContractFactory("CitadelFund");
    const citadelFund = await CitadelFund.deploy(azr.address);
    await citadelFund.deployed();
    console.log("✅ CitadelFund deployed to:", citadelFund.address);

    // 4. Deploy Proof-of-Value Registry
    console.log("\n4️⃣  Deploying Proof-of-Value Registry...");
    const ProofOfValueRegistry = await ethers.getContractFactory("ProofOfValueRegistry");
    const povRegistry = await ProofOfValueRegistry.deploy();
    await povRegistry.deployed();
    console.log("✅ Proof-of-Value Registry deployed to:", povRegistry.address);

    console.log("\n🎉 Deployment Complete!");
    console.log("----------------------------------------------------");
    console.log(`AZR_TOKEN_ADDRESS=${azr.address}`);
    console.log(`NFT_CERTIFICATE_ADDRESS=${nft.address}`);
    console.log(`CITADEL_FUND_ADDRESS=${citadelFund.address}`);
    console.log(`PROOF_OF_VALUE_REGISTRY_ADDRESS=${povRegistry.address}`);
    console.log("----------------------------------------------------");
    console.log("⚠️  Save these addresses to your .env file!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
