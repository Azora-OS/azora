import { BaseMock } from './base.mock';

export interface MockS3Object {
  key: string;
  content: Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
  uploadedAt: Date;
}

/**
 * Mock S3 service for testing
 */
export class MockS3Service extends BaseMock {
  private storage: Map<string, MockS3Object> = new Map();

  /**
   * Upload a file
   */
  async upload(params: {
    key: string;
    content: Buffer | string;
    contentType?: string;
    metadata?: Record<string, string>;
  }): Promise<{ key: string; url: string }> {
    this.trackCall('upload', [params]);

    const content = typeof params.content === 'string' 
      ? Buffer.from(params.content) 
      : params.content;

    const object: MockS3Object = {
      key: params.key,
      content,
      contentType: params.contentType,
      metadata: params.metadata,
      uploadedAt: new Date(),
    };

    this.storage.set(params.key, object);

    return {
      key: params.key,
      url: `https://test-bucket.s3.amazonaws.com/${params.key}`,
    };
  }

  /**
   * Download a file
   */
  async download(key: string): Promise<MockS3Object> {
    this.trackCall('download', [key]);

    const object = this.storage.get(key);
    if (!object) {
      throw new Error(`Object with key ${key} not found`);
    }

    return object;
  }

  /**
   * Delete a file
   */
  async delete(key: string): Promise<void> {
    this.trackCall('delete', [key]);

    if (!this.storage.has(key)) {
      throw new Error(`Object with key ${key} not found`);
    }

    this.storage.delete(key);
  }

  /**
   * Check if file exists
   */
  async exists(key: string): Promise<boolean> {
    this.trackCall('exists', [key]);
    return this.storage.has(key);
  }

  /**
   * List files with prefix
   */
  async list(prefix?: string): Promise<string[]> {
    this.trackCall('list', [prefix]);

    const keys = Array.from(this.storage.keys());
    
    if (prefix) {
      return keys.filter(key => key.startsWith(prefix));
    }

    return keys;
  }

  /**
   * Get file metadata
   */
  async getMetadata(key: string): Promise<Record<string, string> | undefined> {
    this.trackCall('getMetadata', [key]);

    const object = this.storage.get(key);
    return object?.metadata;
  }

  /**
   * Get signed URL (returns mock URL)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    this.trackCall('getSignedUrl', [key, expiresIn]);

    if (!this.storage.has(key)) {
      throw new Error(`Object with key ${key} not found`);
    }

    return `https://test-bucket.s3.amazonaws.com/${key}?signature=mock&expires=${expiresIn}`;
  }

  /**
   * Verify file was uploaded
   */
  verifyFileUploaded(key: string): boolean {
    return this.storage.has(key);
  }

  /**
   * Get all stored objects
   */
  getAllObjects(): MockS3Object[] {
    return Array.from(this.storage.values());
  }

  /**
   * Clear all stored objects
   */
  clearStorage(): void {
    this.storage.clear();
  }

  /**
   * Reset mock state
   */
  reset(): void {
    super.reset();
    this.storage.clear();
  }
}

// Export singleton instance
export const mockS3 = new MockS3Service();
