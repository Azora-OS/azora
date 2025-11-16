/**
 * Receipt Email Service
 * Sends receipt emails to users
 */

import { logger } from '../shared/logging';
import { ReceiptData, PaymentError } from './types';

export interface EmailService {
  sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }>;
  }): Promise<void>;
}

export class ReceiptEmailService {
  constructor(private emailService: EmailService) {}

  /**
   * Send receipt email
   */
  async sendReceiptEmail(
    userEmail: string,
    receipt: ReceiptData,
    pdfBuffer: Buffer
  ): Promise<void> {
    try {
      logger.info('Sending receipt email', {
        userEmail,
        invoiceNumber: receipt.invoiceNumber,
      });

      const emailHtml = this.generateEmailHTML(receipt);

      await this.emailService.sendEmail({
        to: userEmail,
        subject: `Receipt - Invoice ${receipt.invoiceNumber}`,
        html: emailHtml,
        attachments: [
          {
            filename: `receipt-${receipt.invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      logger.info('Receipt email sent successfully', {
        userEmail,
        invoiceNumber: receipt.invoiceNumber,
      });
    } catch (error) {
      logger.error('Failed to send receipt email', {
        error,
        userEmail,
        invoiceNumber: receipt.invoiceNumber,
      });
      throw new PaymentError('Failed to send receipt email', 'EMAIL_ERROR', 500);
    }
  }

  /**
   * Generate receipt email HTML
   */
  private generateEmailHTML(receipt: ReceiptData): string {
    const itemsHTML = receipt.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.unitPrice / 100).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.totalPrice / 100).toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    const total = (receipt.amount / 100).toFixed(2);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #007bff;
              color: white;
              padding: 20px;
              border-radius: 5px 5px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background-color: white;
              padding: 20px;
              border-radius: 0 0 5px 5px;
            }
            .invoice-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 1px solid #eee;
            }
            .invoice-info-item {
              font-size: 14px;
            }
            .invoice-info-label {
              font-weight: bold;
              color: #666;
              margin-bottom: 5px;
            }
            .invoice-info-value {
              font-size: 16px;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background-color: #f5f5f5;
              padding: 10px;
              text-align: left;
              font-weight: bold;
              border-bottom: 2px solid #ddd;
            }
            .totals {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 30px;
            }
            .totals-table {
              width: 300px;
            }
            .totals-table tr {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .totals-table tr.total {
              font-weight: bold;
              font-size: 18px;
              border-bottom: 2px solid #333;
              padding: 15px 0;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 20px;
              border-radius: 5px;
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-top: 20px;
            }
            .button {
              display: inline-block;
              background-color: #007bff;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Receipt</h1>
            </div>
            <div class="content">
              <div class="invoice-info">
                <div class="invoice-info-item">
                  <div class="invoice-info-label">Invoice Number</div>
                  <div class="invoice-info-value">${receipt.invoiceNumber}</div>
                </div>
                <div class="invoice-info-item">
                  <div class="invoice-info-label">Date</div>
                  <div class="invoice-info-value">${receipt.createdAt.toLocaleDateString()}</div>
                </div>
                <div class="invoice-info-item">
                  <div class="invoice-info-label">Payment ID</div>
                  <div class="invoice-info-value">${receipt.paymentId}</div>
                </div>
                <div class="invoice-info-item">
                  <div class="invoice-info-label">Currency</div>
                  <div class="invoice-info-value">${receipt.currency.toUpperCase()}</div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>

              <div class="totals">
                <table class="totals-table">
                  <tr>
                    <td>Subtotal</td>
                    <td style="text-align: right;">$${total}</td>
                  </tr>
                  <tr>
                    <td>Tax</td>
                    <td style="text-align: right;">$0.00</td>
                  </tr>
                  <tr class="total">
                    <td>Total</td>
                    <td style="text-align: right;">$${total}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center;">
                <p>Thank you for your purchase!</p>
                <a href="https://azora.world/account/receipts" class="button">View All Receipts</a>
              </div>

              <div class="footer">
                <p>This is an automated email. Please do not reply to this email.</p>
                <p>For support, visit <a href="https://support.azora.world">support.azora.world</a></p>
                <p>&copy; 2024 Azora OS. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate plain text receipt email
   */
  private generatePlainTextEmail(receipt: ReceiptData): string {
    const items = receipt.items
      .map(
        (item) =>
          `${item.description}\n  Qty: ${item.quantity}, Unit Price: $${(item.unitPrice / 100).toFixed(2)}, Total: $${(item.totalPrice / 100).toFixed(2)}`
      )
      .join('\n\n');

    const total = (receipt.amount / 100).toFixed(2);

    return `
RECEIPT

Invoice Number: ${receipt.invoiceNumber}
Date: ${receipt.createdAt.toLocaleDateString()}
Payment ID: ${receipt.paymentId}
Currency: ${receipt.currency.toUpperCase()}

ITEMS
${items}

TOTALS
Subtotal: $${total}
Tax: $0.00
Total: $${total}

Thank you for your purchase!

For support, visit support.azora.world
© 2024 Azora OS. All rights reserved.
    `;
  }
}

export default ReceiptEmailService;
