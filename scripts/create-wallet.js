import { ethers } from "ethers";

async function main() {
  const wallet = ethers.Wallet.createRandom();
  console.log("New Wallet Address:", wallet.address);
  console.log("New Private Key:", wallet.privateKey);
  console.log("Mnemonic (backup):", wallet.mnemonic.phrase);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});