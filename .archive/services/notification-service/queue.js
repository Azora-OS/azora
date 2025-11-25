const Queue = require('bull');

const emailQueue = new Queue('email-notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

const smsQueue = new Queue('sms-notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

const pushQueue = new Queue('push-notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

emailQueue.process(async (job) => {
  console.log(`Processing email notification: ${job.id}`);
  return { success: true, jobId: job.id };
});

smsQueue.process(async (job) => {
  console.log(`Processing SMS notification: ${job.id}`);
  return { success: true, jobId: job.id };
});

pushQueue.process(async (job) => {
  console.log(`Processing push notification: ${job.id}`);
  return { success: true, jobId: job.id };
});

module.exports = { emailQueue, smsQueue, pushQueue };
