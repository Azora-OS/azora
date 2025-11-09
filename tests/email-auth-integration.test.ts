/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import { describe, it, expect, beforeAll } from '@jest/globals';
import axios from 'axios';

const COVENANT_URL = process.env.COVENANT_URL || 'http://localhost:3009';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3001';

describe('Email Hosting & Login Integration Tests', () => {
  
  describe('Email Hosting Capabilities', () => {
    
    it('should verify email service is operational', async () => {
      const response = await axios.get(`${COVENANT_URL}/health`);
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('operational');
    });

    it('should create quantum-resistant keys for email encryption', async () => {
      const response = await axios.post(`${COVENANT_URL}/api/crypto/quantum-keys`, {
        algorithm: 'kyber768'
      });
      
      expect(response.data.success).toBe(true);
      expect(response.data.keyPair).toHaveProperty('publicKey');
      expect(response.data.keyPair.securityLevel).toBe('quantum-resistant');
    });

    it('should encrypt email data with homomorphic encryption', async () => {
      const keyRes = await axios.post(`${COVENANT_URL}/api/crypto/he/keys`);
      const keyId = keyRes.data.keyPair.id;
      
      const encryptRes = await axios.post(`${COVENANT_URL}/api/crypto/he/encrypt`, {
        data: 'sensitive-email-content',
        keyId
      });
      
      expect(encryptRes.data.success).toBe(true);
      expect(encryptRes.data.encrypted).toHaveProperty('ciphertext');
    });

    it('should create secure email transaction on blockchain', async () => {
      const response = await axios.post(`${COVENANT_URL}/api/blockchain/transaction`, {
        from: 'sender@azora.africa',
        to: 'recipient@azora.africa',
        amount: 0,
        data: {
          type: 'email',
          subject: 'Test Email',
          body: 'Encrypted content',
          timestamp: new Date().toISOString()
        },
        securityLevel: 'intelligence'
      });
      
      expect(response.data.success).toBe(true);
      expect(response.data.transaction).toHaveProperty('id');
    });
  });

  describe('Login Authentication System', () => {
    
    it('should generate zero-knowledge proof for password verification', async () => {
      const response = await axios.post(`${COVENANT_URL}/api/crypto/zkp/generate`, {
        data: { username: 'test@azora.africa', passwordHash: 'hashed_password' },
        statement: 'valid_credentials',
        witness: { salt: 'random_salt' }
      });
      
      expect(response.data.success).toBe(true);
      expect(response.data.proof).toHaveProperty('id');
      expect(response.data.proof).toHaveProperty('publicInputs');
    });

    it('should verify ZKP for authentication', async () => {
      const proofRes = await axios.post(`${COVENANT_URL}/api/crypto/zkp/generate`, {
        data: { username: 'user@azora.africa' },
        statement: 'authenticated_user',
        witness: {}
      });
      
      const proofId = proofRes.data.proof.id;
      const verifyRes = await axios.post(`${COVENANT_URL}/api/crypto/zkp/verify/${proofId}`);
      
      expect(verifyRes.data.success).toBe(true);
      expect(verifyRes.data.verified).toBe(true);
    });

    it('should create MPC session for multi-factor authentication', async () => {
      const response = await axios.post(`${COVENANT_URL}/api/crypto/mpc/session`, {
        sessionId: `auth-${Date.now()}`,
        parties: [
          { id: 'device-1', publicKey: 'key1' },
          { id: 'device-2', publicKey: 'key2' },
          { id: 'device-3', publicKey: 'key3' }
        ],
        threshold: 2
      });
      
      expect(response.data.success).toBe(true);
      expect(response.data.session.threshold).toBe(2);
      expect(response.data.session.partiesCount).toBe(3);
    });

    it('should perform secure computation for auth validation', async () => {
      const sessionRes = await axios.post(`${COVENANT_URL}/api/crypto/mpc/session`, {
        sessionId: `compute-${Date.now()}`,
        parties: [{ id: 'p1' }, { id: 'p2' }],
        threshold: 2
      });
      
      const sessionId = sessionRes.data.session.id;
      const computeRes = await axios.post(`${COVENANT_URL}/api/crypto/mpc/compute/${sessionId}`, {
        computation: 'sum',
        inputs: [1, 1]
      });
      
      expect(computeRes.data.success).toBe(true);
      expect(computeRes.data.result).toBe(2);
    });
  });

  describe('Security & Audit Trail', () => {
    
    it('should generate audit trail for user actions', async () => {
      const txRes = await axios.post(`${COVENANT_URL}/api/blockchain/transaction`, {
        from: 'user@azora.africa',
        to: 'system',
        amount: 0,
        data: { type: 'login', timestamp: new Date().toISOString() },
        securityLevel: 'high'
      });
      
      await axios.post(`${COVENANT_URL}/api/blockchain/mine`);
      
      const auditRes = await axios.get(`${COVENANT_URL}/api/blockchain/audit/user@azora.africa`);
      
      expect(auditRes.data.success).toBe(true);
      expect(auditRes.data.auditTrail).toHaveProperty('auditTrail');
      expect(auditRes.data.auditTrail.cryptographicIntegrity.verified).toBe(true);
    });

    it('should verify transaction integrity', async () => {
      const txRes = await axios.post(`${COVENANT_URL}/api/blockchain/transaction`, {
        from: 'test@azora.africa',
        to: 'verify@azora.africa',
        amount: 0,
        data: { action: 'test' },
        securityLevel: 'standard'
      });
      
      const txId = txRes.data.transaction.id;
      await axios.post(`${COVENANT_URL}/api/blockchain/mine`);
      
      const verifyRes = await axios.get(`${COVENANT_URL}/api/blockchain/verify/${txId}`);
      
      expect(verifyRes.data.success).toBe(true);
      expect(verifyRes.data.verification.verified).toBe(true);
    });

    it('should return intelligence-level security assessment', async () => {
      const response = await axios.get(`${COVENANT_URL}/api/security/assessment`);
      
      expect(response.data.success).toBe(true);
      expect(response.data.assessment.overallSecurityLevel).toBe('INTELLIGENCE');
      expect(response.data.assessment.activeSecurityMeasures).toContain('Quantum-resistant cryptography');
      expect(response.data.assessment.activeSecurityMeasures).toContain('Zero-knowledge proofs');
    });
  });

  describe('Range Proofs for Access Control', () => {
    
    it('should generate range proof for user permissions', async () => {
      const response = await axios.post(`${COVENANT_URL}/api/crypto/zkp/range-proof`, {
        value: 5,
        min: 1,
        max: 10
      });
      
      expect(response.data.success).toBe(true);
      expect(response.data.proof).toHaveProperty('commitment');
      expect(response.data.proof.range).toEqual({ min: 1, max: 10 });
    });

    it('should reject out-of-range values', async () => {
      try {
        await axios.post(`${COVENANT_URL}/api/crypto/zkp/range-proof`, {
          value: 15,
          min: 1,
          max: 10
        });
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response.status).toBe(500);
      }
    });
  });
});
