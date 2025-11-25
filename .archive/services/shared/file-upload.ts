/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * File Upload & Storage Service
 * 
 * Handles file uploads for media, documents, etc.
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export interface UploadConfig {
  destination: string;
  maxSize: number; // bytes
  allowedTypes: string[];
}

const DEFAULT_CONFIG: UploadConfig = {
  destination: './uploads',
  maxSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

/**
 * Configure storage
 */
function configureStorage(config: Partial<UploadConfig> = {}): multer.StorageEngine {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Ensure upload directory exists
  if (!fs.existsSync(finalConfig.destination)) {
    fs.mkdirSync(finalConfig.destination, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, finalConfig.destination);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = crypto.randomBytes(16).toString('hex');
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });
}

/**
 * File filter
 */
function createFileFilter(config: Partial<UploadConfig> = {}): multer.Options['fileFilter'] {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return (req, file, cb) => {
    if (finalConfig.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  };
}

/**
 * Create multer upload middleware
 */
export function createUploadMiddleware(config: Partial<UploadConfig> = {}): multer.Multer {
  const storage = configureStorage(config);
  const fileFilter = createFileFilter(config);
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: finalConfig.maxSize,
    },
  });
}

/**
 * Delete uploaded file
 */
export function deleteUploadedFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (error) => {
      if (error && error.code !== 'ENOENT') {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get file URL
 */
export function getFileUrl(filePath: string, baseUrl: string = '/uploads'): string {
  const relativePath = path.relative('./uploads', filePath);
  return `${baseUrl}/${relativePath}`;
}

/**
 * Get file info
 */
export function getFileInfo(filePath: string): {
  exists: boolean;
  size: number;
  mimeType: string;
  extension: string;
} {
  const exists = fs.existsSync(filePath);
  const stats = exists ? fs.statSync(filePath) : null;
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };

  return {
    exists: exists || false,
    size: stats?.size || 0,
    mimeType: mimeTypes[ext] || 'application/octet-stream',
    extension: ext,
  };
}
