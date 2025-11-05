import Web3 from 'web3';
import axios from 'axios';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AzoraPayService {
  constructor() {
    this.web3 = new Web3(process.env.BLOCKCHAIN_RPC);
    this.azrAbi = JSON.parse(fs.readFileSync(path.join(__dirname, '../../artifacts/contracts/AZR.sol/AZR.json'))).abi;
    this.azrAddress = process.env.AZR_CONTRACT_ADDRESS;
    this.ceoAddress = process.env.CEO_ADDRESS;
    this.privateKey = process.env.PRIVATE_KEY;
    this.account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey);
    this.web3.eth.accounts.wallet.add(this.account);
  }

  async mintAZR(to, amount) {
    try {
      const contract = new this.web3.eth.Contract(this.azrAbi, this.azrAddress);
      const tx = contract.methods.mintLoan(amount);
      const gas = await tx.estimateGas({ from: to });
      const data = tx.encodeABI();
      const txData = {
        to: this.azrAddress,
        data,
        gas,
        from: to
      };
      const signedTx = await this.web3.eth.accounts.signTransaction(txData, this.privateKey);
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      return { txHash: receipt.transactionHash, minted: amount };
    } catch (err) {
      return { error: err.message };
    }
  }

  async burnAZR(from, amount) {
    try {
      const contract = new this.web3.eth.Contract(this.azrAbi, this.azrAddress);
      const tx = contract.methods.burn(amount);
      const gas = await tx.estimateGas({ from });
      const data = tx.encodeABI();
      const txData = {
        to: this.azrAddress,
        data,
        gas,
        from
      };
      const signedTx = await this.web3.eth.accounts.signTransaction(txData, this.privateKey);
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      return { txHash: receipt.transactionHash, burned: amount };
    } catch (err) {
      return { error: err.message };
    }
  }

  async getAZRBalance(address) {
    try {
      const contract = new this.web3.eth.Contract(this.azrAbi, this.azrAddress);
      const balance = await contract.methods.balanceOf(address).call();
      return { balance: this.web3.utils.fromWei(balance, 'ether') };
    } catch (err) {
      return { error: err.message };
    }
  }

  async callContract(method, params = [], from = this.account.address) {
    try {
      const contract = new this.web3.eth.Contract(this.azrAbi, this.azrAddress);
      const result = await contract.methods[method](...params).call({ from });
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  // Add withdraw to ZAR via Paystack
  async withdrawToZAR(amountInAZR, zarAmount, userAddress) {
    try {
      const response = await axios.post('https://api.paystack.co/transfer', {
        source: 'balance',
        amount: zarAmount * 100, // Paystack expects kobo
        recipient: process.env.PAYSTACK_RECIPIENT_CODE,
        reason: 'AZR withdrawal'
      }, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
      });
      // Burn AZR after successful transfer
      const burnResult = await this.burnAZR(userAddress, amountInAZR);
      return { transfer: response.data, burn: burnResult };
    } catch (err) {
      return { error: err.message };
    }
  }
}

export default new AzoraPayService();