/**
 * Receipt Generator Service
 * Generates receipt data and formats for PDF/email
 */

import { logger } from '../shared/logging';
import { Payment, ReceiptData, ReceiptItem, PaymentError } from './types';

export class ReceiptGenerator {
  private readonly invoiceNumberPrefix: string;

  constructor(invoiceNumberPrefix: string = 'INV') {
    this.invoiceNumberPrefix = invoiceNumberPrefix;
  }

  /**
   * Generate receipt data from payment
   */
  async generateReceipt(payment: Payment, courseTitle?: string): Promise<ReceiptData> {
    try {
      logger.info('Generating receipt', { paymentId: payment.id });

      // Generate invoice number
      const invoiceNumber = this.generateInvoiceNumber(payment.id);

      // Create receipt items
      const items = this.createReceiptItems(payment, courseTitle);

      // Calculate totals
      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

      const receiptData: ReceiptData = {
        id: `receipt-${payment.id}`,
        paymentId: payment.id,
        userId: payment.userId,
        invoiceNumber,
        amount: totalAmount,
        currency: payment.currency,
        items,
        pdfUrl: '', // Will be set after PDF generation
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      logger.info('Receipt data generated', {
        paymentId: payment.id,
        invoiceNumber,
        amount: totalAmount,
      });

      return receiptData;
    } catch (error) {
      logger.error('Failed to generate receipt', { error, paymentId: payment.id });
      throw new PaymentError('Failed to generate receipt', 'RECEIPT_ERROR', 500);
    }
  }

  /**
   * Format receipt data for display
   */
  formatReceiptData(receipt: ReceiptData): {
    invoiceNumber: string;
    date: string;
    amount: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: string;
      totalPrice: string;
    }>;
    subtotal: string;
    total: string;
  } {
    const subtotal = receipt.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = subtotal;

    return {
      invoiceNumber: receipt.invoiceNumber,
      date: receipt.createdAt.toLocaleDateString(),
      amount: this.formatCurrency(receipt.amount, receipt.currency),
      items: receipt.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: this.formatCurrency(item.unitPrice, receipt.currency),
        totalPrice: this.formatCurrency(item.totalPrice, receipt.currency),
      })),
      subtotal: this.formatCurrency(subtotal, receipt.currency),
      total: this.formatCurrency(total, receipt.currency),
    };
  }

  /**
   * Create receipt items from payment
   */
  private createReceiptItems(payment: Payment, courseTitle?: string): ReceiptItem[] {
    const items: ReceiptItem[] = [];

    if (payment.courseId && courseTitle) {
      items.push({
        description: `Course: ${courseTitle}`,
        quantity: 1,
        unitPrice: payment.amount,
        totalPrice: payment.amount,
      });
    } else if (payment.subscriptionTierId) {
      const tierName = this.getSubscriptionTierName(payment.subscriptionTierId);
      items.push({
        description: `${tierName} Subscription`,
        quantity: 1,
        unitPrice: payment.amount,
        totalPrice: payment.amount,
      });
    } else {
      items.push({
        description: 'Payment',
        quantity: 1,
        unitPrice: payment.amount,
        totalPrice: payment.amount,
      });
    }

    return items;
  }

  /**
   * Generate unique invoice number
   */
  private generateInvoiceNumber(paymentId: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${this.invoiceNumberPrefix}-${timestamp}-${random}`;
  }

  /**
   * Get subscription tier name
   */
  private getSubscriptionTierName(tierId: string): string {
    const tierNames: Record<string, string> = {
      free: 'Free',
      pro: 'Pro',
      enterprise: 'Enterprise',
    };

    return tierNames[tierId] || 'Subscription';
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number, currency: string): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Convert cents to dollars
    return formatter.format(amount / 100);
  }

  /**
   * Validate receipt data
   */
  validateReceiptData(receipt: ReceiptData): boolean {
    if (!receipt.invoiceNumber) {
      logger.warn('Invalid receipt: missing invoice number');
      return false;
    }

    if (!receipt.items || receipt.items.length === 0) {
      logger.warn('Invalid receipt: no items');
      return false;
    }

    if (receipt.amount <= 0) {
      logger.warn('Invalid receipt: invalid amount');
      return false;
    }

    return true;
  }
}

export default ReceiptGenerator;
