import axios from 'axios';
import crypto from 'crypto';
import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const web3 = new Web3(process.env.BLOCKCHAIN_RPC);
const azrAbi = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts/contracts/AZR.sol/AZR.json'))).abi;
const azrAddress = process.env.AZR_CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;
const ceoAddress = process.env.CEO_ADDRESS;
const lunoApiKey = process.env.LUNO_API_KEY;
const lunoSecret = process.env.LUNO_SECRET;

const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

const contract = new web3.eth.Contract(azrAbi, azrAddress);

// Luno API helper
function signLunoRequest(method, path, body = '') {
  const timestamp = Date.now();
  const message = `${timestamp}${method.toUpperCase()}${path}${body}`;
  const signature = crypto.createHmac('sha512', lunoSecret).update(message).digest('hex');
  return { timestamp, signature };
}

async function withdrawToLunoZAR(amountInAZR) {
  try {
    // Assume 1 AZR = 10 ZAR (example rate; integrate real price feed)
    const zarAmount = amountInAZR * 10;

    // Burn AZR
    const burnTx = contract.methods.burn(ceoAddress, web3.utils.toWei(amountInAZR.toString(), 'ether'));
    const gas = await burnTx.estimateGas({ from: account.address });
    const data = burnTx.encodeABI();
    const txData = {
      to: azrAddress,
      data,
      gas,
      from: account.address
    };
    const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
    const burnReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Burned AZR:', burnReceipt.transactionHash);

    // Withdraw ZAR to Luno wallet
    const path = '/api/1/send';
    const body = `amount=${zarAmount}&currency=ZAR&address=${process.env.LUNO_ZAR_ADDRESS}&description=Azora withdrawal`;
    const { timestamp, signature } = signLunoRequest('POST', path, body);

    const response = await axios.post(`https://api.luno.com${path}`, body, {
      headers: {
        'Authorization': `LUNO-API-KEY ${lunoApiKey}`,
        'LUNO-TIMESTAMP': timestamp,
        'LUNO-SIGNATURE': signature,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Withdrew to Luno ZAR:', response.data);
    console.log(`Sent ${zarAmount} ZAR to your Luno wallet. Use for offices and development!`);
  } catch (err) {
    console.error('Withdrawal failed:', err.message);
  }
}

// Example: Withdraw 100K AZR
withdrawToLunoZAR(100000);