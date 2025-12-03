import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

interface DeploymentConfig {
  contracts: {
    AZRToken: string;
    CitadelFund: string;
    ProofOfValue: string;
    AzoraNFT: string;
    UbuntuGovernance: string;
  };
}

export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contracts: {
    azrToken?: ethers.Contract;
    citadelFund?: ethers.Contract;
    proofOfValue?: ethers.Contract;
    azoraNFT?: ethers.Contract;
  } = {};

  constructor(rpcUrl: string, privateKey: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
  }

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

interface DeploymentConfig {
  contracts: {
    AZRToken: string;
    CitadelFund: string;
    ProofOfValue: string;
    AzoraNFT: string;
    UbuntuGovernance: string;
  };
}

export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contracts: {
    azrToken?: ethers.Contract;
    citadelFund?: ethers.Contract;
    proofOfValue?: ethers.Contract;
    azoraNFT?: ethers.Contract;
  } = {};
  private isDevelopment: boolean = false;

  constructor(rpcUrl: string, privateKey: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
  }

  async initialize() {
    const deploymentPath = path.join(__dirname, '../../../blockchain/deployments.json');

    if (!fs.existsSync(deploymentPath)) {
      console.warn('⚠️  Contracts not deployed. Running in development mode with mock responses.');
      this.isDevelopment = true;
      return;
    }

    try {
      const deployment: DeploymentConfig = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

      const AZRTokenABI = ['function balanceOf(address) view returns (uint256)', 'function transfer(address, uint256) returns (bool)', 'function ubuntuMine(address, string, uint256)', 'function rewardUbuntuContribution(address, uint256, string)', 'function totalSupply() view returns (uint256)'];

      const CitadelFundABI = ['function collectRevenue(uint256, string)', 'function grantScholarship(address, uint256)', 'function distributeGrant(address, uint256, string)', 'function getBalance() view returns (uint256)', 'function totalCollected() view returns (uint256)', 'function totalDistributed() view returns (uint256)'];

      const ProofOfValueABI = ['function submitProof(string, uint256) returns (bytes32)', 'function rewardValue(bytes32)', 'function totalValue(address) view returns (uint256)'];

      const AzoraNFTABI = ['function mintCertificate(address, string, string, uint256, string) returns (uint256)', 'function tokenURI(uint256) view returns (string)', 'function ownerOf(uint256) view returns (address)'];

      this.contracts.azrToken = new ethers.Contract(deployment.contracts.AZRToken, AZRTokenABI, this.signer);
      this.contracts.citadelFund = new ethers.Contract(deployment.contracts.CitadelFund, CitadelFundABI, this.signer);
      this.contracts.proofOfValue = new ethers.Contract(deployment.contracts.ProofOfValue, ProofOfValueABI, this.signer);
      this.contracts.azoraNFT = new ethers.Contract(deployment.contracts.AzoraNFT, AzoraNFTABI, this.signer);

      console.log('✅ Blockchain contracts initialized successfully');
    } catch (error) {
      console.warn('⚠️  Failed to initialize contracts. Running in development mode:', error.message);
      this.isDevelopment = true;
    }
  }

  async mintAZR(to: string, knowledgeProof: string, knowledgeLevel: number): Promise<string> {
    const tx = await this.contracts.azrToken!.ubuntuMine(to, knowledgeProof, knowledgeLevel);
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }

  async transferAZR(to: string, amount: string): Promise<string> {
    const tx = await this.contracts.azrToken!.transfer(to, ethers.utils.parseEther(amount));
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.contracts.azrToken!.balanceOf(address);
    return ethers.utils.formatEther(balance);
  }

  async collectCitadelRevenue(amount: string, source: string): Promise<string> {
    const amountWei = ethers.utils.parseEther(amount);
    await this.contracts.azrToken!.transfer(this.contracts.citadelFund!.address, amountWei);
    const tx = await this.contracts.citadelFund!.collectRevenue(amountWei, source);
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }

  async grantScholarship(student: string, amount: string): Promise<string> {
    const tx = await this.contracts.citadelFund!.grantScholarship(student, ethers.utils.parseEther(amount));
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }

  async getCitadelBalance(): Promise<{ balance: string; collected: string; distributed: string }> {
    const balance = await this.contracts.citadelFund!.getBalance();
    const collected = await this.contracts.citadelFund!.totalCollected();
    const distributed = await this.contracts.citadelFund!.totalDistributed();
    
    return {
      balance: ethers.utils.formatEther(balance),
      collected: ethers.utils.formatEther(collected),
      distributed: ethers.utils.formatEther(distributed)
    };
  }

  async submitValueProof(contentHash: string, valueScore: number): Promise<string> {
    const tx = await this.contracts.proofOfValue!.submitProof(contentHash, valueScore);
    const receipt = await tx.wait();
    const proofId = receipt.events?.find((e: any) => e.event === 'ValueProofSubmitted')?.args?.proofId;
    return proofId;
  }

  async rewardValue(proofId: string): Promise<string> {
    const tx = await this.contracts.proofOfValue!.rewardValue(proofId);
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }

  async mintCertificate(student: string, courseId: string, studentId: string, score: number, metadataUri: string): Promise<{ tokenId: string; txHash: string }> {
    const tx = await this.contracts.azoraNFT!.mintCertificate(student, courseId, studentId, score, metadataUri);
    const receipt = await tx.wait();
    const tokenId = receipt.events?.find((e: any) => e.event === 'CertificateMinted')?.args?.tokenId.toString();
    
    return {
      tokenId,
      txHash: receipt.transactionHash
    };
  }

  async getCertificateOwner(tokenId: string): Promise<string> {
    return await this.contracts.azoraNFT!.ownerOf(tokenId);
  }
}
