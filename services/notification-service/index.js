const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3011;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const notifications = new Map();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'notification-service' });
});

app.post('/api/notifications/email', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@azora.world',
      to,
      subject,
      text,
      html
    });

    const notification = {
      id: info.messageId,
      type: 'email',
      to,
      subject,
      status: 'sent',
      sentAt: new Date()
    };

    notifications.set(notification.id, notification);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/push', async (req, res) => {
  const { userId, title, body, data } = req.body;
  
  const notification = {
    id: Date.now().toString(),
    type: 'push',
    userId,
    title,
    body,
    data,
    status: 'queued',
    createdAt: new Date()
  };

  notifications.set(notification.id, notification);
  res.json(notification);
});

app.get('/api/notifications/:userId', (req, res) => {
  const userNotifications = Array.from(notifications.values())
    .filter(n => n.userId === req.params.userId)
    .sort((a, b) => b.createdAt - a.createdAt);
  
  res.json(userNotifications);
});

app.listen(PORT, () => {
  console.log(`🔔 Notification service running on port ${PORT}`);
});
