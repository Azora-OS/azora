const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying Azora Smart Contracts to Polygon Mumbai...");

    // Deploy AZRToken
    console.log("\n📝 Deploying AZRToken...");
    const AZRToken = await hre.ethers.getContractFactory("AZRToken");
    const azrToken = await AZRToken.deploy();
    await azrToken.deployed();
    console.log("✅ AZRToken deployed to:", azrToken.address);

    // Deploy NFTCertificate
    console.log("\n📝 Deploying NFTCertificate...");
    const NFTCertificate = await hre.ethers.getContractFactory("NFTCertificate");
    const nftCertificate = await NFTCertificate.deploy();
    await nftCertificate.deployed();
    console.log("✅ NFTCertificate deployed to:", nftCertificate.address);

    // Save addresses to .env file
    console.log("\n💾 Saving contract addresses...");
    const fs = require('fs');
    const envPath = '../../.env';

    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update or add contract addresses
    const addresses = `
# Smart Contract Addresses (Polygon Mumbai)
AZR_TOKEN_ADDRESS=${azrToken.address}
NFT_CERTIFICATE_ADDRESS=${nftCertificate.address}
BLOCKCHAIN_NETWORK=mumbai
BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
`;

    // Remove old addresses if they exist
    envContent = envContent.replace(/# Smart Contract Addresses.*\n.*\n.*\n.*\n.*\n/s, '');
    envContent += addresses;

    fs.writeFileSync(envPath, envContent);
    console.log("✅ Contract addresses saved to .env");

    // Verify contracts on Polygonscan
    console.log("\n🔍 Verifying contracts on Polygonscan...");
    console.log("Run these commands to verify:");
    console.log(`npx hardhat verify --network mumbai ${azrToken.address}`);
    console.log(`npx hardhat verify --network mumbai ${nftCertificate.address}`);

    console.log("\n✅ Deployment complete!");
    console.log("\n📋 Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`AZRToken:        ${azrToken.address}`);
    console.log(`NFTCertificate:  ${nftCertificate.address}`);
    console.log(`Network:         Polygon Mumbai (Testnet)`);
    console.log(`Explorer:        https://mumbai.polygonscan.com`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("\n🎉 Next steps:");
    console.log("1. Update services to use new contract addresses");
    console.log("2. Test minting/transfers");
    console.log("3. Deploy to mainnet when ready");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
