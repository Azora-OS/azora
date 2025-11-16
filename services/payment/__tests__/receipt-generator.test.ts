/**
 * Receipt Generator Service Tests
 * Tests for receipt data generation
 */

import { ReceiptGenerator } from '../receipt-generator';
import { PaymentStatus } from '../types';

// Mock logger
jest.mock('../../shared/logging', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('ReceiptGenerator', () => {
  let receiptGenerator: ReceiptGenerator;

  beforeEach(() => {
    receiptGenerator = new ReceiptGenerator('INV');
  });

  describe('generateReceipt', () => {
    it('should generate receipt data from payment', async () => {
      const payment = {
        id: 'pay-123',
        userId: 'user-123',
        amount: 9999,
        currency: 'usd',
        status: PaymentStatus.SUCCEEDED,
        courseId: 'course-123',
        createdAt: new Date(),
      } as any;

      const receipt = await receiptGenerator.generateReceipt(payment, 'Advanced TypeScript');

      expect(receipt.id).toBeDefined();
      expect(receipt.paymentId).toBe('pay-123');
      expect(receipt.userId).toBe('user-123');
      expect(receipt.invoiceNumber).toBeDefined();
      expect(receipt.amount).toBe(9999);
      expect(receipt.currency).toBe('usd');
      expect(receipt.items).toHaveLength(1);
    });

    it('should create receipt items for course purchase', async () => {
      const payment = {
        id: 'pay-123',
        userId: 'user-123',
        amount: 9999,
        currency: 'usd',
        status: PaymentStatus.SUCCEEDED,
        courseId: 'course-123',
        createdAt: new Date(),
      } as any;

      const receipt = await receiptGenerator.generateReceipt(payment, 'Advanced TypeScript');

      expect(receipt.items[0].description).toContain('Advanced TypeScript');
      expect(receipt.items[0].quantity).toBe(1);
      expect(receipt.items[0].unitPrice).toBe(9999);
      expect(receipt.items[0].totalPrice).toBe(9999);
    });

    it('should create receipt items for subscription', async () => {
      const payment = {
        id: 'pay-123',
        userId: 'user-123',
        amount: 999,
        currency: 'usd',
        status: PaymentStatus.SUCCEEDED,
        subscriptionTierId: 'pro',
        createdAt: new Date(),
      } as any;

      const receipt = await receiptGenerator.generateReceipt(payment);

      expect(receipt.items[0].description).toContain('Pro Subscription');
    });

    it('should generate unique invoice numbers', async () => {
      const payment = {
        id: 'pay-123',
        userId: 'user-123',
        amount: 9999,
        currency: 'usd',
        status: PaymentStatus.SUCCEEDED,
        createdAt: new Date(),
      } as any;

      const receipt1 = await receiptGenerator.generateReceipt(payment);
      const receipt2 = await receiptGenerator.generateReceipt(payment);

      expect(receipt1.invoiceNumber).not.toBe(receipt2.invoiceNumber);
    });
  });

  describe('formatReceiptData', () => {
    it('should format receipt data for display', () => {
      const receipt = {
        id: 'receipt-123',
        paymentId: 'pay-123',
        userId: 'user-123',
        invoiceNumber: 'INV-123456-ABC',
        amount: 9999,
        currency: 'usd',
        items: [
          {
            description: 'Course: Advanced TypeScript',
            quantity: 1,
            unitPrice: 9999,
            totalPrice: 9999,
          },
        ],
        pdfUrl: '',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      };

      const formatted = receiptGenerator.formatReceiptData(receipt);

      expect(formatted.invoiceNumber).toBe('INV-123456-ABC');
      expect(formatted.amount).toContain('99.99');
      expect(formatted.items).toHaveLength(1);
      expect(formatted.total).toContain('99.99');
    });

    it('should format currency correctly', () => {
      const receipt = {
        id: 'receipt-123',
        paymentId: 'pay-123',
        userId: 'user-123',
        invoiceNumber: 'INV-123456-ABC',
        amount: 5000,
        currency: 'usd',
        items: [
          {
            description: 'Payment',
            quantity: 1,
            unitPrice: 5000,
            totalPrice: 5000,
          },
        ],
        pdfUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const formatted = receiptGenerator.formatReceiptData(receipt);

      expect(formatted.amount).toBe('$50.00');
      expect(formatted.total).toBe('$50.00');
    });
  });

  describe('validateReceiptData', () => {
    it('should validate correct receipt data', () => {
      const receipt = {
        id: 'receipt-123',
        paymentId: 'pay-123',
        userId: 'user-123',
        invoiceNumber: 'INV-123456-ABC',
        amount: 9999,
        currency: 'usd',
        items: [
          {
            description: 'Course',
            quantity: 1,
            unitPrice: 9999,
            totalPrice: 9999,
          },
        ],
        pdfUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const isValid = receiptGenerator.validateReceiptData(receipt);

      expect(isValid).toBe(true);
    });

    it('should reject receipt with missing invoice number', () => {
      const receipt = {
        id: 'receipt-123',
        paymentId: 'pay-123',
        userId: 'user-123',
        invoiceNumber: '',
        amount: 9999,
        currency: 'usd',
        items: [{ description: 'Course', quantity: 1, unitPrice: 9999, totalPrice: 9999 }],
        pdfUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const isValid = receiptGenerator.validateReceiptData(receipt);

      expect(isValid).toBe(false);
    });

    it('should reject receipt with no items', () => {
      const receipt = {
        id: 'receipt-123',
        paymentId: 'pay-123',
        userId: 'user-123',
        invoiceNumber: 'INV-123456-ABC',
        amount: 9999,
        currency: 'usd',
        items: [],
        pdfUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const isValid = receiptGenerator.validateReceiptData(receipt);

      expect(isValid).toBe(false);
    });

    it('should reject receipt with invalid amount', () => {
      const receipt = {
        id: 'receipt-123',
        paymentId: 'pay-123',
        userId: 'user-123',
        invoiceNumber: 'INV-123456-ABC',
        amount: 0,
        currency: 'usd',
        items: [{ description: 'Course', quantity: 1, unitPrice: 0, totalPrice: 0 }],
        pdfUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const isValid = receiptGenerator.validateReceiptData(receipt);

      expect(isValid).toBe(false);
    });
  });
});
