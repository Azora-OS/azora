const { uploadMetadata } = require('../src/utils/upload');

describe('uploadMetadata', () => {
  it('returns a data URI when no IPFS or S3 configured', async () => {
    delete process.env.IPFS_API_URL;
    delete process.env.S3_BUCKET;
    const result = await uploadMetadata({ name: 'test' });
    expect(typeof result).toBe('string');
    expect(result.startsWith('data:application/json;base64,')).toBeTruthy();
  });
});
