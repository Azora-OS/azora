const AWS = require('aws-sdk');

class UbuntuS3Service {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    this.ubuntu = 'I store because we preserve together';
  }

  async uploadUbuntuFile(file, key, bucket = process.env.S3_BUCKET) {
    const params = {
      Bucket: bucket,
      Key: `ubuntu/${key}`,
      Body: file,
      Metadata: {
        ubuntu: 'Ubuntu file storage',
        philosophy: 'My data becomes our knowledge'
      }
    };
    
    return await this.s3.upload(params).promise();
  }
}

module.exports = UbuntuS3Service;