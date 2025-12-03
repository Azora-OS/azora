import { ethers } from 'ethers';
import { BlockchainService } from './blockchain-service';
import { config } from './config';
import { IpfsService } from '../../azora-ipfs/src/ipfs-service';

// Basic ABI for NFT interactions
const NFT_ABI = [
    "function mintCertificate(address to, string memory tokenURI) public returns (uint256)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function tokenURI(uint256 tokenId) public view returns (string)"
];

export class NftService {
    private blockchainService: BlockchainService;
    private contractAddress: string;
    private ipfsService: IpfsService;

    constructor() {
        this.blockchainService = new BlockchainService();
        this.ipfsService = new IpfsService();
        this.contractAddress = config.contracts.nftCertificate;
    }

    private async getContract(): Promise<ethers.Contract> {
        return this.blockchainService.getContract(this.contractAddress, NFT_ABI);
    }

    async mintCertificate(recipient: string, studentName: string, courseName: string, grade: string): Promise<any> {
        try {
            // 1. Create Metadata
            const metadata = {
                name: `Azora Certificate: ${courseName}`,
                description: `Certificate of completion for ${studentName}`,
                image: 'ipfs://QmPlaceholderImage', // In real app, generate and upload image first
                attributes: [
                    { trait_type: 'Student', value: studentName },
                    { trait_type: 'Course', value: courseName },
                    { trait_type: 'Grade', value: grade },
                    { trait_type: 'Date', value: new Date().toISOString() }
                ]
            };

            // 2. Upload Metadata to IPFS
            console.log('Uploading metadata to IPFS...');
            const ipfsResult = await this.ipfsService.uploadJSON(metadata);

            if (!ipfsResult.success || !ipfsResult.url) {
                throw new Error(`IPFS upload failed: ${ipfsResult.error}`);
            }

            const tokenURI = ipfsResult.url;
            console.log(`Metadata uploaded: ${tokenURI}`);

            // 3. Mint NFT with Token URI
            const contract = await this.getContract();
            const tx = await contract.mintCertificate(recipient, tokenURI);
            await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                recipient,
                tokenURI,
                message: 'Certificate minted successfully'
            };
        } catch (error: any) {
            console.error('Minting failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async verifyCertificate(tokenId: string): Promise<{ owner: string, uri: string }> {
        const contract = await this.getContract();
        const owner = await contract.ownerOf(tokenId);
        const uri = await contract.tokenURI(tokenId);
        return { owner, uri };
    }
}
