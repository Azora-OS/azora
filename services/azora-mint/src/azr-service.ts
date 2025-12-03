import { ethers } from 'ethers';
import { BlockchainService } from './blockchain-service';
import { config } from './config';

// Basic ABI for ERC20 interactions
const AZR_ABI = [
    "function mint(address to, uint256 amount) public",
    "function burn(uint256 amount) public",
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function balanceOf(address owner) public view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export class AzrService {
    private blockchainService: BlockchainService;
    private contractAddress: string;

    constructor() {
        this.blockchainService = new BlockchainService();
        this.contractAddress = config.contracts.azrToken;
    }

    private async getContract(): Promise<ethers.Contract> {
        return this.blockchainService.getContract(this.contractAddress, AZR_ABI);
    }

    async mint(to: string, amount: string): Promise<string> {
        const contract = await this.getContract();
        const tx = await contract.mint(to, ethers.parseEther(amount));
        await tx.wait();
        return tx.hash;
    }

    async burn(amount: string): Promise<string> {
        const contract = await this.getContract();
        const tx = await contract.burn(ethers.parseEther(amount));
        await tx.wait();
        return tx.hash;
    }

    async transfer(to: string, amount: string): Promise<string> {
        const contract = await this.getContract();
        const tx = await contract.transfer(to, ethers.parseEther(amount));
        await tx.wait();
        return tx.hash;
    }

    async getBalance(address: string): Promise<string> {
        const contract = await this.getContract();
        const balance = await contract.balanceOf(address);
        return ethers.formatEther(balance);
    }
}
