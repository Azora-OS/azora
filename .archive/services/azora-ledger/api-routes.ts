/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

BLOCKCHAIN API ROUTES
*/

import { Router } from 'express';
import { azoraLedger } from './index';

export const blockchainRouter = Router();

// Wallet endpoints
blockchainRouter.post('/wallet/create', async (req, res) => {
  try {
    const { userId } = req.body;
    const wallet = await azoraLedger.wallet.createWallet(userId);
    res.json({ success: true, wallet: { ...wallet, privateKey: undefined } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

blockchainRouter.get('/wallet/:address/balance', async (req, res) => {
  try {
    const { address } = req.params;
    const balances = await azoraLedger.wallet.getBalance(address);
    res.json({ success: true, balances });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

blockchainRouter.post('/wallet/transfer', async (req, res) => {
  try {
    const { from, to, amount, privateKey } = req.body;
    const transaction = await azoraLedger.wallet.transfer(from, to, amount, privateKey);
    res.json({ success: true, transaction });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// NFT Certificate endpoints
blockchainRouter.post('/nft/mint', async (req, res) => {
  try {
    const { certificate, privateKey } = req.body;
    const txHash = await azoraLedger.certificates.mintCertificate(certificate, privateKey);
    res.json({ success: true, txHash });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

blockchainRouter.get('/nft/:tokenId/verify', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const verified = await azoraLedger.certificates.verifyCertificate(tokenId);
    res.json({ success: true, verified });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

blockchainRouter.get('/nft/:tokenId/metadata', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const metadata = await azoraLedger.certificates.getCertificateMetadata(tokenId);
    res.json({ success: true, metadata });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AZR Token reward endpoints
blockchainRouter.post('/rewards/mint', async (req, res) => {
  try {
    const { userId, amount, proof, privateKey } = req.body;
    const transaction = await azoraLedger.wallet.rewardProofOfKnowledge(userId, amount, proof, privateKey);
    res.json({ success: true, transaction });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default blockchainRouter;
