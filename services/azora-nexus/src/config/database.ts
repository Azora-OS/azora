/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose from 'mongoose';
import { logger } from '@/utils/logger';

const NEXUS_MOCK_MODE = (process.env.NEXUS_MOCK_MODE ?? 'true').toLowerCase() !== 'false';
const ALLOW_OFFLINE = (process.env.NEXUS_ALLOW_OFFLINE ?? 'true').toLowerCase() !== 'false';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (NEXUS_MOCK_MODE) {
    logger.warn('NEXUS_MOCK_MODE enabled - skipping MongoDB connection');
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/azora-nexus';

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
    };

    await mongoose.connect(mongoURI, options);
    isConnected = true;

    logger.info('MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

  } catch (error) {
    if (ALLOW_OFFLINE) {
      logger.warn('MongoDB connection failed, continuing in offline mode', { error: (error as Error).message });
    } else {
      logger.error('MongoDB connection failed:', error);
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('MongoDB disconnection failed:', error);
  }
};