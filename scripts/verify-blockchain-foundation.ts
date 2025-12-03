import { BlockchainService } from '../services/azora-blockchain/src/blockchain-service';
import { AzrService } from '../services/azora-mint/src/azr-service';
import { NftService } from '../services/azora-mint/src/nft-service';

async function verify() {
    console.log('Verifying Blockchain Foundation Services...');

    try {
        console.log('1. Initializing BlockchainService...');
        const blockchainService = new BlockchainService();
        console.log('✅ BlockchainService initialized successfully.');

        console.log('2. Initializing AzrService...');
        const azrService = new AzrService();
        console.log('✅ AzrService initialized successfully.');

        console.log('3. Initializing NftService...');
        const nftService = new NftService();
        console.log('✅ NftService initialized successfully.');

        console.log('🎉 All Blockchain Foundation services verified!');
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

verify();
