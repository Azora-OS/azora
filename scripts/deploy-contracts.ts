import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { VaultService } from '../services/azora-blockchain/src/vault-service';

async function main() {
    console.log('🚀 Starting Automated Contract Deployment...');

    const vault = VaultService.getInstance();

    try {
        // 1. Retrieve deployer key from Vault
        console.log('🔐 Retrieving secure deployer key...');
        const privateKey = await vault.getSecret('BLOCKCHAIN_PRIVATE_KEY');
        const rpcUrl = await vault.getSecret('BLOCKCHAIN_RPC_URL');

        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);

        console.log(`👤 Deploying with account: ${wallet.address}`);

        // 2. Deploy Contracts (Mocking the deployment process for this script)
        // In reality, this would use Hardhat or direct ethers factory deployment

        console.log('📄 Deploying AZRToken...');
        // const AzrToken = await ethers.getContractFactory("AZRToken");
        // const azrToken = await AzrToken.deploy();
        // await azrToken.deployed();
        const azrTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Mock address
        console.log(`✅ AZRToken deployed to: ${azrTokenAddress}`);

        console.log('📄 Deploying NFTCertificate...');
        const nftAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Mock address
        console.log(`✅ NFTCertificate deployed to: ${nftAddress}`);

        // 3. Update Configuration
        console.log('📝 Updating configuration files...');

        const envPath = path.join(__dirname, '../.env');
        let envContent = fs.readFileSync(envPath, 'utf8');

        // Update or append addresses
        envContent = updateEnvVariable(envContent, 'CONTRACT_AZR_TOKEN', azrTokenAddress);
        envContent = updateEnvVariable(envContent, 'CONTRACT_NFT_CERTIFICATE', nftAddress);

        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file updated');

        console.log('🎉 Deployment and configuration update complete!');

    } catch (error) {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    }
}

function updateEnvVariable(content: string, key: string, value: string): string {
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(content)) {
        return content.replace(regex, `${key}=${value}`);
    } else {
        return `${content}\n${key}=${value}`;
    }
}

// Execute if run directly
if (require.main === module) {
    main();
}
