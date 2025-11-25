/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Credentials API Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { credentialService } from './credential-service';
import { AcademicCredential, CredentialType } from '../azora-institutional-system/academic-credentialing';
import { connectAzoraDatabase } from '../shared/database/connection';

const app = express();
const PORT = process.env.CREDENTIALS_PORT || 4205;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to Azora database
connectAzoraDatabase(process.env.DATABASE_URI || process.env.MONGODB_URI).catch(console.error);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Azora Credentials & Certification System',
    timestamp: new Date(),
  });
});

// ========== CREDENTIAL DOCUMENTS ==========

app.post('/api/credentials/generate', async (req, res) => {
  try {
    const { credential, options } = req.body;
    const document = await credentialService.generateCredentialDocument(
      credential as AcademicCredential,
      options
    );
    res.json(document);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/credentials/:documentId', (req, res) => {
  const document = credentialService.getCredentialDocument(req.params.documentId);
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json(document);
});

// ========== DIGITAL BADGES ==========

app.post('/api/badges', async (req, res) => {
  try {
    const { studentId, studentNumber, credentialId, badgeType, title, description } = req.body;
    const badge = await credentialService.createBadge(
      studentId,
      studentNumber,
      credentialId,
      badgeType,
      title,
      description
    );
    res.json(badge);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ========== CREDENTIAL WALLET ==========

app.get('/api/wallet/:studentNumber', (req, res) => {
  const wallet = credentialService.getWallet(req.params.studentNumber);
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  res.json(wallet);
});

// ========== VERIFICATION ==========

app.get('/api/verify/:uid', async (req, res) => {
  const result = await credentialService.verifyCredential(req.params.uid);
  res.json(result);
});

// ========== LEDGER ==========

app.get('/api/ledger/:recordId', (req, res) => {
  const record = credentialService.getLedgerRecord(req.params.recordId);
  if (!record) {
    return res.status(404).json({ error: 'Ledger record not found' });
  }
  res.json(record);
});

app.get('/api/ledger/student/:studentNumber', (req, res) => {
  const records = credentialService.getStudentLedgerRecords(req.params.studentNumber);
  res.json({ records });
});

app.listen(PORT, () => {
  console.log(`\n🎓 AZORA CREDENTIALS & CERTIFICATION SYSTEM running on port ${PORT}\n`);
  console.log(`   📜 Credentials: http://localhost:${PORT}/api/credentials/generate`);
  console.log(`   🏆 Badges: http://localhost:${PORT}/api/badges`);
  console.log(`   💼 Wallet: http://localhost:${PORT}/api/wallet/:studentNumber`);
  console.log(`   ✅ Verification: http://localhost:${PORT}/api/verify/:uid`);
  console.log(`   ⛓️  Ledger: http://localhost:${PORT}/api/ledger/:recordId`);
  console.log(`   ❤️  Health: http://localhost:${PORT}/health\n`);
});

export default app;
