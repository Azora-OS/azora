const nodemailer = require('nodemailer');

class EmailEngine {
  constructor() {
    this.configured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
    
    if (this.configured) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async send({ to, subject, html, text }) {
    if (!this.configured) {
      console.log('[EMAIL] Mock send:', { to, subject });
      return { success: true, mode: 'mock', to, subject };
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[EMAIL] Error:', error.message);
      throw error;
    }
  }
}

module.exports = new EmailEngine();
