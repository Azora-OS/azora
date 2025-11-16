/**
 * Receipt Repository Service
 * Handles database operations for receipts
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/logging';
import { ReceiptData, PaymentError } from './types';

export interface Receipt extends ReceiptData {
  id: string;
}

export class ReceiptRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Store receipt in database
   */
  async storeReceipt(receipt: ReceiptData): Promise<Receipt> {
    try {
      logger.info('Storing receipt', {
        invoiceNumber: receipt.invoiceNumber,
        paymentId: receipt.paymentId,
      });

      const storedReceipt = await this.prisma.receipt.create({
        data: {
          paymentId: receipt.paymentId,
          userId: receipt.userId,
          invoiceNumber: receipt.invoiceNumber,
          amount: receipt.amount,
          currency: receipt.currency,
          items: receipt.items,
          pdfUrl: receipt.pdfUrl,
          emailSentAt: receipt.emailSentAt,
        },
      });

      logger.info('Receipt stored successfully', {
        receiptId: storedReceipt.id,
        invoiceNumber: receipt.invoiceNumber,
      });

      return storedReceipt as Receipt;
    } catch (error) {
      logger.error('Failed to store receipt', {
        error,
        invoiceNumber: receipt.invoiceNumber,
      });
      throw new PaymentError('Failed to store receipt', 'DB_ERROR', 500);
    }
  }

  /**
   * Get receipt by ID
   */
  async getReceiptById(receiptId: string): Promise<Receipt | null> {
    try {
      logger.info('Fetching receipt by ID', { receiptId });

      const receipt = await this.prisma.receipt.findUnique({
        where: { id: receiptId },
      });

      return receipt as Receipt | null;
    } catch (error) {
      logger.error('Failed to fetch receipt', { error, receiptId });
      throw new PaymentError('Failed to fetch receipt', 'DB_ERROR', 500);
    }
  }

  /**
   * Get receipt by payment ID
   */
  async getReceiptByPaymentId(paymentId: string): Promise<Receipt | null> {
    try {
      logger.info('Fetching receipt by payment ID', { paymentId });

      const receipt = await this.prisma.receipt.findUnique({
        where: { paymentId },
      });

      return receipt as Receipt | null;
    } catch (error) {
      logger.error('Failed to fetch receipt by payment ID', { error, paymentId });
      throw new PaymentError('Failed to fetch receipt', 'DB_ERROR', 500);
    }
  }

  /**
   * Get receipt by invoice number
   */
  async getReceiptByInvoiceNumber(invoiceNumber: string): Promise<Receipt | null> {
    try {
      logger.info('Fetching receipt by invoice number', { invoiceNumber });

      const receipt = await this.prisma.receipt.findUnique({
        where: { invoiceNumber },
      });

      return receipt as Receipt | null;
    } catch (error) {
      logger.error('Failed to fetch receipt by invoice number', {
        error,
        invoiceNumber,
      });
      throw new PaymentError('Failed to fetch receipt', 'DB_ERROR', 500);
    }
  }

  /**
   * Get user receipts with pagination
   */
  async getUserReceipts(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    receipts: Receipt[];
    total: number;
    limit: number;
    offset: number;
  }> {
    try {
      logger.info('Fetching user receipts', { userId, limit, offset });

      const [receipts, total] = await Promise.all([
        this.prisma.receipt.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.receipt.count({ where: { userId } }),
      ]);

      logger.info('User receipts fetched', {
        userId,
        count: receipts.length,
        total,
      });

      return {
        receipts: receipts as Receipt[],
        total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error('Failed to fetch user receipts', { error, userId });
      throw new PaymentError('Failed to fetch receipts', 'DB_ERROR', 500);
    }
  }

  /**
   * Update receipt with PDF URL
   */
  async updateReceiptPdfUrl(receiptId: string, pdfUrl: string): Promise<Receipt> {
    try {
      logger.info('Updating receipt PDF URL', { receiptId, pdfUrl });

      const receipt = await this.prisma.receipt.update({
        where: { id: receiptId },
        data: { pdfUrl },
      });

      logger.info('Receipt PDF URL updated', { receiptId });

      return receipt as Receipt;
    } catch (error) {
      logger.error('Failed to update receipt PDF URL', { error, receiptId });
      throw new PaymentError('Failed to update receipt', 'DB_ERROR', 500);
    }
  }

  /**
   * Update receipt email sent timestamp
   */
  async updateReceiptEmailSent(receiptId: string): Promise<Receipt> {
    try {
      logger.info('Updating receipt email sent timestamp', { receiptId });

      const receipt = await this.prisma.receipt.update({
        where: { id: receiptId },
        data: { emailSentAt: new Date() },
      });

      logger.info('Receipt email sent timestamp updated', { receiptId });

      return receipt as Receipt;
    } catch (error) {
      logger.error('Failed to update receipt email sent timestamp', {
        error,
        receiptId,
      });
      throw new PaymentError('Failed to update receipt', 'DB_ERROR', 500);
    }
  }

  /**
   * Delete receipt
   */
  async deleteReceipt(receiptId: string): Promise<void> {
    try {
      logger.info('Deleting receipt', { receiptId });

      await this.prisma.receipt.delete({
        where: { id: receiptId },
      });

      logger.info('Receipt deleted', { receiptId });
    } catch (error) {
      logger.error('Failed to delete receipt', { error, receiptId });
      throw new PaymentError('Failed to delete receipt', 'DB_ERROR', 500);
    }
  }

  /**
   * Get receipts by date range
   */
  async getReceiptsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    receipts: Receipt[];
    total: number;
    limit: number;
    offset: number;
  }> {
    try {
      logger.info('Fetching receipts by date range', {
        userId,
        startDate,
        endDate,
        limit,
        offset,
      });

      const [receipts, total] = await Promise.all([
        this.prisma.receipt.findMany({
          where: {
            userId,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.receipt.count({
          where: {
            userId,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
      ]);

      return {
        receipts: receipts as Receipt[],
        total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error('Failed to fetch receipts by date range', { error, userId });
      throw new PaymentError('Failed to fetch receipts', 'DB_ERROR', 500);
    }
  }
}

export default ReceiptRepository;
