const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { createLogger } = require('@azora/shared-services/logging');

class TamperProofDataService {
  constructor() {
    this.logger = createLogger('TamperProofDataService');
    this.dataStore = new Map(); // In production, this would be a database
    this.auditTrail = [];
  }

  /**
   * Store data with tamper-proof signature
   */
  storeData(userId, dataType, data, metadata = {}) {
    try {
      // Generate unique ID for this data entry
      const dataId = uuidv4();

      // Create hash of the data
      const dataHash = this.createHash(data);

      // Create digital signature
      const signature = this.createSignature(dataHash, userId);

      // Create tamper-proof entry
      const entry = {
        id: dataId,
        userId,
        dataType,
        data,
        dataHash,
        signature,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store in data store
      this.dataStore.set(dataId, entry);

      // Add to audit trail
      this.addToAuditTrail('CREATE', dataId, userId, dataType);

      this.logger.info(`Data stored with ID: ${dataId}`, { userId, dataType });

      return {
        id: dataId,
        dataHash,
        signature,
        createdAt: entry.createdAt
      };
    } catch (error) {
      this.logger.error('Error storing data', error);
      throw error;
    }
  }

  /**
   * Retrieve data and verify its integrity
   */
  retrieveData(dataId, userId) {
    try {
      const entry = this.dataStore.get(dataId);

      if (!entry) {
        throw new Error('Data not found');
      }

      // Verify user has access
      if (entry.userId !== userId) {
        throw new Error('Unauthorized access');
      }

      // Verify data integrity
      const isValid = this.verifyDataIntegrity(entry);

      // Add to audit trail
      this.addToAuditTrail('READ', dataId, userId, entry.dataType);

      this.logger.info(`Data retrieved with ID: ${dataId}`, { userId, isValid });

      return {
        id: entry.id,
        data: entry.data,
        dataType: entry.dataType,
        metadata: entry.metadata,
        isValid,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      };
    } catch (error) {
      this.logger.error('Error retrieving data', error);
      throw error;
    }
  }

  /**
   * Update data with new signature
   */
  updateData(dataId, userId, newData, metadata = {}) {
    try {
      const entry = this.dataStore.get(dataId);

      if (!entry) {
        throw new Error('Data not found');
      }

      // Verify user has access
      if (entry.userId !== userId) {
        throw new Error('Unauthorized access');
      }

      // Verify current data integrity before update
      if (!this.verifyDataIntegrity(entry)) {
        throw new Error('Data has been tampered with');
      }

      // Create new hash and signature
      const newDataHash = this.createHash(newData);
      const newSignature = this.createSignature(newDataHash, userId);

      // Update entry
      entry.data = newData;
      entry.dataHash = newDataHash;
      entry.signature = newSignature;
      entry.metadata = { ...entry.metadata, ...metadata };
      entry.updatedAt = new Date();

      // Store updated entry
      this.dataStore.set(dataId, entry);

      // Add to audit trail
      this.addToAuditTrail('UPDATE', dataId, userId, entry.dataType);

      this.logger.info(`Data updated with ID: ${dataId}`, { userId, dataType: entry.dataType });

      return {
        id: dataId,
        dataHash: newDataHash,
        signature: newSignature,
        updatedAt: entry.updatedAt
      };
    } catch (error) {
      this.logger.error('Error updating data', error);
      throw error;
    }
  }

  /**
   * Delete data
   */
  deleteData(dataId, userId) {
    try {
      const entry = this.dataStore.get(dataId);

      if (!entry) {
        throw new Error('Data not found');
      }

      // Verify user has access
      if (entry.userId !== userId) {
        throw new Error('Unauthorized access');
      }

      // Remove from data store
      this.dataStore.delete(dataId);

      // Add to audit trail
      this.addToAuditTrail('DELETE', dataId, userId, entry.dataType);

      this.logger.info(`Data deleted with ID: ${dataId}`, { userId, dataType: entry.dataType });

      return {
        success: true,
        message: 'Data deleted successfully'
      };
    } catch (error) {
      this.logger.error('Error deleting data', error);
      throw error;
    }
  }

  /**
   * Verify data integrity
   */
  verifyDataIntegrity(entry) {
    try {
      // Recreate hash of the data
      const currentHash = this.createHash(entry.data);

      // Verify hash matches
      if (currentHash !== entry.dataHash) {
        return false;
      }

      // Verify signature
      const isValidSignature = this.verifySignature(entry.dataHash, entry.signature, entry.userId);

      return isValidSignature;
    } catch (error) {
      this.logger.error('Error verifying data integrity', error);
      return false;
    }
  }

  /**
   * Create hash of data
   */
  createHash(data) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Create digital signature
   */
  createSignature(dataHash, userId) {
    // In production, this would use proper cryptographic keys
    // For demo purposes, we'll use a simple approach
    const secret = process.env.SIGNATURE_SECRET || 'azora-tamper-proof-secret';
    const signatureData = `${dataHash}:${userId}:${secret}`;
    return crypto.createHmac('sha256', secret).update(signatureData).digest('hex');
  }

  /**
   * Verify digital signature
   */
  verifySignature(dataHash, signature, userId) {
    try {
      const expectedSignature = this.createSignature(dataHash, userId);
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Add entry to audit trail
   */
  addToAuditTrail(action, dataId, userId, dataType) {
    const auditEntry = {
      id: uuidv4(),
      action,
      dataId,
      userId,
      dataType,
      timestamp: new Date()
    };

    this.auditTrail.push(auditEntry);
  }

  /**
   * Get audit trail for a specific data entry
   */
  getAuditTrail(dataId) {
    return this.auditTrail.filter(entry => entry.dataId === dataId);
  }

  /**
   * List all data entries for a user
   */
  listUserData(userId) {
    const userEntries = [];

    for (const [id, entry] of this.dataStore.entries()) {
      if (entry.userId === userId) {
        userEntries.push({
          id: entry.id,
          dataType: entry.dataType,
          dataHash: entry.dataHash,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt
        });
      }
    }

    return userEntries;
  }

  /**
   * Verify all data for a user
   */
  verifyAllUserData(userId) {
    const results = [];

    for (const [id, entry] of this.dataStore.entries()) {
      if (entry.userId === userId) {
        const isValid = this.verifyDataIntegrity(entry);
        results.push({
          id: entry.id,
          dataType: entry.dataType,
          isValid,
          createdAt: entry.createdAt
        });
      }
    }

    return results;
  }
}

module.exports = new TamperProofDataService();
