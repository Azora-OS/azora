const Queue = require('bull');
const emailEngine = require('./engines/email');

const notificationQueue = new Queue('notifications', process.env.REDIS_URL || 'redis://localhost:6379');

notificationQueue.process(async (job) => {
  const { type, data } = job.data;
  
  switch (type) {
    case 'email':
      return await emailEngine.send(data);
    case 'sms':
      console.log('[SMS] Not configured:', data.to);
      return { success: true, mode: 'mock' };
    case 'push':
      console.log('[PUSH] Not configured:', data.userId);
      return { success: true, mode: 'mock' };
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
});

notificationQueue.on('completed', (job, result) => {
  console.log(`✅ Notification ${job.id} completed:`, result);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`❌ Notification ${job.id} failed:`, err.message);
});

module.exports = { notificationQueue };
