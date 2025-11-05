// email-service service placeholder
import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Add to .env: your_gmail@gmail.com
        pass: process.env.EMAIL_PASS  // Add to .env: your_gmail_app_password
      }
    });
  }

  async sendEmail(to, subject, text) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text
      });
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  }
}

export default new EmailService();