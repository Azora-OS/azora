import { ethers } from 'ethers';
import { BlockchainService } from './blockchain-service';
import { config } from './config';

// Basic ABI for NFT interactions
const NFT_ABI = [
    "function mintCertificate(address to, string memory tokenURI) public returns (uint256)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function tokenURI(uint256 tokenId) public view returns (string)"
];

export class NftService {
    private blockchainService: BlockchainService;
    private contractAddress: string;

    constructor() {
        this.blockchainService = new BlockchainService();
        this.contractAddress = config.contracts.nftCertificate;
    }

    private async getContract(): Promise<ethers.Contract> {
        return this.blockchainService.getContract(this.contractAddress, NFT_ABI);
    }

    async mintCertificate(to: string, tokenURI: string): Promise<string> {
        const contract = await this.getContract();
        const tx = await contract.mintCertificate(to, tokenURI);
        const receipt = await tx.wait();
        // In a real implementation we would parse logs to get the tokenId
        return tx.hash;
    }

    async verifyCertificate(tokenId: string): Promise<{ owner: string, uri: string }> {
        const contract = await this.getContract();
        const owner = await contract.ownerOf(tokenId);
        const uri = await contract.tokenURI(tokenId);
        return { owner, uri };
    }
}
