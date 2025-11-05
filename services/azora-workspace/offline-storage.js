/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const fs = require('fs').promises;
const path = require('path');

// Offline storage for zero-rated data usage
class OfflineStorage {
  constructor() {
    this.storagePath = path.join(__dirname, 'offline-data');
    this.ensureStoragePath();
  }

  async ensureStoragePath() {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
    } catch (error) {
      console.error('Failed to create offline storage path:', error);
    }
  }

  // Store data locally for offline access
  async store(key, data) {
    try {
      const filePath = path.join(this.storagePath, `${key}.json`);
      await fs.writeFile(filePath, JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0'
      }, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to store offline data:', error);
      return false;
    }
  }

  // Retrieve data from local storage
  async retrieve(key) {
    try {
      const filePath = path.join(this.storagePath, `${key}.json`);
      const content = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(content);

      // Check if data is still valid (24 hours)
      const age = Date.now() - parsed.timestamp;
      if (age > 24 * 60 * 60 * 1000) {
        await this.delete(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      return null;
    }
  }

  // Delete stored data
  async delete(key) {
    try {
      const filePath = path.join(this.storagePath, `${key}.json`);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get all stored keys
  async getAllKeys() {
    try {
      const files = await fs.readdir(this.storagePath);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error) {
      return [];
    }
  }

  // Compress data for zero-rated transmission
  compressData(data) {
    // Simple compression by removing unnecessary whitespace
    if (typeof data === 'string') {
      return data.replace(/\s+/g, ' ').trim();
    }
    return JSON.stringify(data, (key, value) => {
      // Remove null values and empty arrays/objects
      if (value === null) return undefined;
      if (Array.isArray(value) && value.length === 0) return undefined;
      if (typeof value === 'object' && Object.keys(value).length === 0) return undefined;
      return value;
    });
  }

  // Middleware for offline API handling
  middleware(req, res, next) {
    // Handle offline data requests
    if (req.method === 'GET') {
      const key = req.path.replace('/api/offline/', '');
      this.retrieve(key).then(data => {
        if (data) {
          res.json({
            data,
            source: 'offline',
            timestamp: Date.now()
          });
        } else {
          res.status(404).json({ error: 'Data not available offline' });
        }
      }).catch(next);
    }
    // Store data for offline use
    else if (req.method === 'POST') {
      const key = req.path.replace('/api/offline/', '');
      this.store(key, req.body).then(success => {
        if (success) {
          res.json({ message: 'Data stored offline' });
        } else {
          res.status(500).json({ error: 'Failed to store offline data' });
        }
      }).catch(next);
    } else {
      next();
    }
  }

  // Queue email for offline sending
  async queueEmail(emailData) {
    try {
      const queueKey = `email-queue-${emailData.userId}`;
      const existingQueue = await this.retrieve(queueKey) || [];
      existingQueue.push({
        ...emailData,
        queuedAt: emailData.queuedAt || new Date(),
        retryCount: emailData.retryCount || 0,
      });
      return await this.store(queueKey, existingQueue);
    } catch (error) {
      console.error('Failed to queue email:', error);
      return false;
    }
  }

  // Get queued emails for a user
  async getQueuedEmails(userId) {
    try {
      const queueKey = `email-queue-${userId}`;
      return await this.retrieve(queueKey) || [];
    } catch (error) {
      console.error('Failed to get queued emails:', error);
      return [];
    }
  }

  // Mark email as sent and remove from queue
  async markEmailSent(emailId) {
    try {
      // Find and remove from all queues (we don't know which user it belongs to)
      const allKeys = await this.getAllKeys();
      const queueKeys = allKeys.filter(key => key.startsWith('email-queue-'));

      for (const queueKey of queueKeys) {
        const queue = await this.retrieve(queueKey) || [];
        const filteredQueue = queue.filter(email => email.emailId !== emailId);
        if (filteredQueue.length !== queue.length) {
          await this.store(queueKey, filteredQueue);
          break;
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to mark email as sent:', error);
      return false;
    }
  }

  // Increment retry count for failed email
  async incrementRetryCount(emailId) {
    try {
      const allKeys = await this.getAllKeys();
      const queueKeys = allKeys.filter(key => key.startsWith('email-queue-'));

      for (const queueKey of queueKeys) {
        const queue = await this.retrieve(queueKey) || [];
        const emailIndex = queue.findIndex(email => email.emailId === emailId);
        if (emailIndex !== -1) {
          queue[emailIndex].retryCount = (queue[emailIndex].retryCount || 0) + 1;
          await this.store(queueKey, queue);
          break;
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to increment retry count:', error);
      return false;
    }
  }

  // Mark email as failed
  async markEmailFailed(emailId, errorMessage) {
    try {
      const allKeys = await this.getAllKeys();
      const queueKeys = allKeys.filter(key => key.startsWith('email-queue-'));

      for (const queueKey of queueKeys) {
        const queue = await this.retrieve(queueKey) || [];
        const emailIndex = queue.findIndex(email => email.emailId === emailId);
        if (emailIndex !== -1) {
          queue[emailIndex].failed = true;
          queue[emailIndex].error = errorMessage;
          queue[emailIndex].failedAt = new Date();
          await this.store(queueKey, queue);
          break;
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to mark email as failed:', error);
      return false;
    }
  }

  // Cache email for offline reading
  async cacheEmail(emailId, emailData) {
    try {
      const cacheKey = `email-cache-${emailData.userId}`;
      const existingCache = await this.retrieve(cacheKey) || {};
      existingCache[emailId] = {
        ...emailData,
        cachedAt: new Date(),
      };
      return await this.store(cacheKey, existingCache);
    } catch (error) {
      console.error('Failed to cache email:', error);
      return false;
    }
  }

  // Get cached emails for offline reading
  async getCachedEmails(userId) {
    try {
      const cacheKey = `email-cache-${userId}`;
      const cache = await this.retrieve(cacheKey) || {};
      return Object.values(cache).sort((a, b) => new Date(b.cachedAt) - new Date(a.cachedAt));
    } catch (error) {
      console.error('Failed to get cached emails:', error);
      return [];
    }
  }
}

module.exports = new OfflineStorage();