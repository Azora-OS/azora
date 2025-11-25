const { ethers } = require('ethers');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.contracts = {};
  }

  async initialize(rpcUrl, privateKey) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  async deployToken() {
    const AzoraToken = require('../../packages/contracts/AzoraToken.json');
    const factory = new ethers.ContractFactory(AzoraToken.abi, AzoraToken.bytecode, this.wallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    this.contracts.token = contract;
    return await contract.getAddress();
  }

  async mintTokens(to, amount) {
    const tx = await this.contracts.token.mint(to, ethers.parseEther(amount.toString()));
    return await tx.wait();
  }

  async getBalance(address) {
    return await this.contracts.token.balanceOf(address);
  }
}

module.exports = new BlockchainService();
