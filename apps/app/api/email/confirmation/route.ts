import { NextRequest, NextResponse } from 'next/server';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

const sentFrom = new Sender("noreply@azora.world", "Azora OS");

interface EmailRequest {
  to: string;
  subject: string;
  transactionType: string;
  amount: string;
  currency: string;
  transactionId: string;
  walletAddress?: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();
    const { to, subject, transactionType, amount, currency, transactionId, walletAddress, description } = body;

    if (!to || !subject || !transactionType || !amount || !currency || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const recipients = [
      new Recipient(to, "Azora User")
    ];

    // Create HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .transaction-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .amount { font-size: 24px; font-weight: bold; color: #667eea; }
            .status { display: inline-block; padding: 5px 15px; background: #28a745; color: white; border-radius: 20px; font-size: 12px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Transaction Confirmed</h1>
              <p>Your ${transactionType} has been processed successfully</p>
            </div>
            <div class="content">
              <h2>Transaction Details</h2>
              <div class="transaction-details">
                <p><strong>Transaction Type:</strong> ${transactionType}</p>
                <p><strong>Amount:</strong> <span class="amount">${amount} ${currency}</span></p>
                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                ${walletAddress ? `<p><strong>Wallet Address:</strong> ${walletAddress}</p>` : ''}
                ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
                <p><strong>Status:</strong> <span class="status">CONFIRMED</span></p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <p>Thank you for using Azora OS! Your transaction has been securely processed and recorded on our blockchain ledger.</p>

              <p>If you have any questions about this transaction, please contact our support team.</p>

              <div class="footer">
                <p>This is an automated message from Azora OS. Please do not reply to this email.</p>
                <p>© 2025 Azora OS - Building Africa's Future</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
      Transaction Confirmed

      Your ${transactionType} has been processed successfully.

      Transaction Details:
      - Type: ${transactionType}
      - Amount: ${amount} ${currency}
      - Transaction ID: ${transactionId}
      ${walletAddress ? `- Wallet Address: ${walletAddress}` : ''}
      ${description ? `- Description: ${description}` : ''}
      - Status: CONFIRMED
      - Date: ${new Date().toLocaleString()}

      Thank you for using Azora OS!

      This is an automated message. Please do not reply.
    `;

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(htmlContent)
      .setText(textContent);

    await mailerSend.email.send(emailParams);

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully'
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}

