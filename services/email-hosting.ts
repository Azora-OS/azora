/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * Email Hosting Service
 * Professional email infrastructure for @azora.africa domains
 * Aligns with Constitution Article VI: Infrastructure Independence
 */

import nodemailer from 'nodemailer';
import { createTransport, Transporter } from 'nodemailer';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface EmailConfigAuth {
  user: string;
  pass: string;
}

interface EmailConfig {
  service: string;
  host: string;
  port: number;
  secure: boolean;
  auth: EmailConfigAuth;
}

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

class EmailHostingService {
  private config: EmailConfig;
  private transporter: Transporter;

  constructor() {
    this.config = this.loadConfig();
    this.transporter = this.createTransporter();
  }

  loadConfig(): EmailConfig {
    const configPath = join(process.cwd(), 'config', 'email-config.json');
    if (existsSync(configPath)) {
      return JSON.parse(readFileSync(configPath, 'utf8'));
    }

    return {
      service: 'Zoho',
      host: 'smtp.zoho.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'admin@azora.africa',
        pass: process.env.EMAIL_PASS || '',
      },
    };
  }

  createTransporter(): Transporter {
    return createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.auth.user,
        pass: this.config.auth.pass,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const mailOptions = {
        from: this.config.auth.user,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyConfiguration(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.transporter.verify();
      console.log('Email configuration verified successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Email configuration verification failed:', error);
      return { success: false, error: error.message };
    }
  }

  async createAccount(username: string, password?: string): Promise<{ success: boolean; email: string; instructions: string; }> {
    console.log(`Creating email account: ${username}@azora.africa`);
    // In a real implementation, this would call the email provider's API
    return {
      success: true,
      email: `${username}@azora.africa`,
      instructions: 'Account created. Please configure your email client with the following settings.',
    };
  }

  getEmailClientConfig(): any {
    return {
      incoming: {
        server: 'imap.zoho.com',
        port: 993,
        encryption: 'SSL/TLS',
      },
      outgoing: {
        server: 'smtp.zoho.com',
        port: 587,
        encryption: 'STARTTLS',
      },
      username: 'your-email@azora.africa',
      password: 'your-password',
    };
  }
}

const emailHostingService = new EmailHostingService();
emailHostingService.verifyConfiguration();
export default emailHostingService;
