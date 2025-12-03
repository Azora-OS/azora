import { ethers, Contract, Wallet, providers } from 'ethers';
import dotenv from 'dotenv';
import NFTCertificateABI from './abis/NFTCertificate.json';

dotenv.config();

export class NftService {
    private provider: providers.JsonRpcProvider;
    private wallet: Wallet;
    private contract: Contract;

    constructor() {
        const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
        this.provider = new providers.JsonRpcProvider(rpcUrl);

        const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
        if (!privateKey) {
            console.warn('⚠️ No private key provided. NftService will be read-only.');
            this.wallet = Wallet.createRandom().connect(this.provider);
        } else {
            this.wallet = new Wallet(privateKey, this.provider);
        }

        const contractAddress = process.env.NFT_CERTIFICATE_ADDRESS;
        if (!contractAddress) {
            console.error('❌ NFT_CERTIFICATE_ADDRESS not found in environment variables');
            this.contract = new Contract(ethers.constants.AddressZero, NFTCertificateABI, this.wallet);
        } else {
            this.contract = new Contract(contractAddress, NFTCertificateABI, this.wallet);
        }
    }

    async mintCertificate(to: string, metadata: string): Promise<any> {
        const tx = await this.contract.mint(to, metadata);
        const receipt = await tx.wait();

        // Extract tokenId from events if possible, or just return receipt
        const event = receipt.events?.find((e: any) => e.event === 'Transfer');
        const tokenId = event?.args?.tokenId?.toString();

        return { receipt, tokenId };
    }

    async getCertificateMetadata(tokenId: string): Promise<string> {
        return await this.contract.tokenURI(tokenId);
    }

    async getOwner(tokenId: string): Promise<string> {
        return await this.contract.ownerOf(tokenId);
    }
}

export const nftService = new NftService();
