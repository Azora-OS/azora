import { create } from 'ipfs-http-client';
import AWS from 'aws-sdk';

export async function uploadMetadata(metadata: any): Promise<string> {
  if (process.env.IPFS_API_URL) {
    try {
      const client = create({ url: process.env.IPFS_API_URL });
      const { path } = await client.add(JSON.stringify(metadata));
      return `ipfs://${path}`;
    } catch (err) {
      console.warn('IPFS upload failed, attempting S3 fallback', err);
    }
  }

  if (process.env.S3_BUCKET) {
    const s3 = new AWS.S3({ region: process.env.S3_REGION });
    const key = `nft-metadata/${Date.now()}.json`;
    await s3.putObject({ Bucket: process.env.S3_BUCKET!, Key: key, Body: JSON.stringify(metadata), ContentType: 'application/json' }).promise();
    const url = process.env.S3_URL_PREFIX ? `${process.env.S3_URL_PREFIX}/${key}` : `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;
    return url;
  }

  // Fallback: return embedded JSON data URI
  return `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;
}
