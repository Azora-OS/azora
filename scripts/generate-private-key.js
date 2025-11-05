import { Wallet } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wallet = Wallet.createRandom();
console.log('New Private Key:', wallet.privateKey);
console.log('New Address:', wallet.address);

const envPath = path.join(__dirname, '../.env');
let envContent = fs.readFileSync(envPath, 'utf8');
envContent = envContent.replace(/PRIVATE_KEY=.*/, `PRIVATE_KEY=${wallet.privateKey}`);
envContent = envContent.replace(/CEO_ADDRESS=.*/, `CEO_ADDRESS=${wallet.address}`);
fs.writeFileSync(envPath, envContent);

console.log('.env updated with new private key and address.');