const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

const ABI_PATH = path.join(__dirname, '../../artifacts/contracts/AZR.sol/AZR.json');
const AZR_ABI = fs.existsSync(ABI_PATH) ? require(ABI_PATH).abi : [];
const web3 = new Web3(process.env.BLOCKCHAIN_RPC);
const contract = new web3.eth.Contract(AZR_ABI, process.env.AZR_CONTRACT_ADDRESS);

async function mint(to, amount) {
  const tx = contract.methods.mint(to, amount);
  const signed = await web3.eth.accounts.signTransaction({
    to: process.env.AZR_CONTRACT_ADDRESS,
    data: tx.encodeABI(),
    gas: 200000,
  }, process.env.PRIVATE_KEY);
  const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
  return receipt.transactionHash;
}

async function balanceOf(address) {
  return await contract.methods.balanceOf(address).call();
}

module.exports = { mint, balanceOf };
