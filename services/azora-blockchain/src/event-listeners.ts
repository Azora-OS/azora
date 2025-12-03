import { blockchainService } from './blockchain-service';
import { recordBlockchainEvent } from './blockchain-repository';

let stopAzr: (() => void) | null = null;
let stopNFT: (() => void) | null = null;

export async function startEventListeners() {
  try {
    // AZR Transfer events
    const azrAddress = process.env.AZR_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    stopAzr = blockchainService.listenToEvent(azrAddress, ["event Transfer(address indexed from, address indexed to, uint256 value)"], 'Transfer', async (from: string, to: string, value: any, event: any) => {
      console.log('AZR Transfer event:', from, to, value.toString());
      await recordBlockchainEvent({ type: 'azr_transfer', source: 'AZR', payload: { from, to, value: value.toString(), blockNumber: event.blockNumber, transactionHash: event.transactionHash } });
    });

    // NFT certificate Transfer events
    const nftAddress = process.env.NFT_CERTIFICATE_CONTRACT_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    stopNFT = blockchainService.listenToEvent(nftAddress, ["event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"], 'Transfer', async (from: string, to: string, tokenId: any, event: any) => {
      console.log('NFT Transfer event:', from, to, tokenId.toString());
      await recordBlockchainEvent({ type: 'nft_transfer', source: 'NFTCertificate', payload: { from, to, tokenId: tokenId.toString(), blockNumber: event.blockNumber, transactionHash: event.transactionHash } });
    });

    console.log('✅ Blockchain event listeners started');
  } catch (err) {
    console.error('Failed to start event listeners', err);
    throw err;
  }
}

export async function stopEventListeners() {
  if (stopAzr) stopAzr();
  if (stopNFT) stopNFT();
  console.log('🛑 Blockchain event listeners stopped');
}

export default { startEventListeners, stopEventListeners };
