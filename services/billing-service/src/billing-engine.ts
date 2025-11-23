/**
 * Billing Engine
 * Handles invoice generation, payment processing, and billing reports
 */

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { BusinessLogicTracing } from '../../shared/observability/distributed-tracing';

interface BillingConfig {
  stripeSecretKey: string;
  currency: string;
  taxRate: number;
}

interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  userId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  createdAt: Date;
  paidAt?: Date;
}

interface BillingReport {
  period: string;
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  outstandingAmount: number;
  averageInvoiceValue: number;
}

/**
 * Billing Engine Implementation
 */
export class BillingEngine {
  private prisma: PrismaClient;
  private stripe: Stripe;
  private config: BillingConfig;

  constructor(config: BillingConfig) {
    this.config = config;
    this.prisma = new PrismaClient();
    this.stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2023-10-16' });
  }

  /**
   * Create invoice
   */
  async createInvoice(
    userId: string,
    items: InvoiceItem[],
    dueDate: Date
  ): Promise<Invoice> {
    return BusinessLogicTracing.traceOperation(
      'billing.create_invoice',
      { userId, itemCount: items.length },
      async () => {
        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + item.amount * item.quantity, 0);
        const tax = subtotal * this.config.taxRate;
        const total = subtotal + tax;

        // Create invoice in database
        const invoice = await this.prisma.invoice.create({
          data: {
            userId,
            subtotal,
            tax,
            total,
            status: 'draft',
            dueDate,
            items: {
              create: items.map((item) => ({
                description: item.description,
                amount: item.amount,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              })),
            },
          },
          include: { items: true },
        });

        return {
          id: invoice.id,
          userId: invoice.userId,
          items: invoice.items as InvoiceItem[],
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          total: invoice.total,
          status: invoice.status as any,
          dueDate: invoice.dueDate,
          createdAt: invoice.createdAt,
        };
      }
    );
  }

  /**
   * Send invoice
   */
  async sendInvoice(invoiceId: string): Promise<void> {
    return BusinessLogicTracing.traceOperation(
      'billing.send_invoice',
      { invoiceId },
      async () => {
        const invoice = await this.prisma.invoice.findUnique({
          where: { id: invoiceId },
          include: { user: true },
        });

        if (!invoice) {
          throw new Error('Invoice not found');
        }

        // Update status
        await this.prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: 'sent' },
        });

        // Send email (implementation would use email service)
        console.log(`Invoice ${invoiceId} sent to ${invoice.user.email}`);
      }
    );
  }

  /**
   * Process payment
   */
  async processPayment(
    invoiceId: string,
    paymentMethodId: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    return BusinessLogicTracing.traceOperation(
      'billing.process_payment',
      { invoiceId, paymentMethodId },
      async () => {
        const invoice = await this.prisma.invoice.findUnique({
          where: { id: invoiceId },
          include: { user: true },
        });

        if (!invoice) {
          return { success: false, error: 'Invoice not found' };
        }

        if (invoice.status === 'paid') {
          return { success: false, error: 'Invoice already paid' };
        }

        try {
          // Create payment intent with Stripe
          const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(invoice.total * 100), // Convert to cents
            currency: this.config.currency.toLowerCase(),
            payment_method: paymentMethodId,
            confirm: true,
            metadata: {
              invoiceId,
              userId: invoice.userId,
            },
          });

          if (paymentIntent.status === 'succeeded') {
            // Update invoice status
            await this.prisma.invoice.update({
              where: { id: invoiceId },
              data: {
                status: 'paid',
                paidAt: new Date(),
                transactionId: paymentIntent.id,
              },
            });

            return {
              success: true,
              transactionId: paymentIntent.id,
            };
          } else {
            return {
              success: false,
              error: `Payment failed: ${paymentIntent.status}`,
            };
          }
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
          };
        }
      }
    );
  }

  /**
   * Generate billing report
   */
  async generateBillingReport(
    startDate: Date,
    endDate: Date
  ): Promise<BillingReport> {
    return BusinessLogicTracing.traceOperation(
      'billing.generate_report',
      { startDate, endDate },
      async () => {
        const invoices = await this.prisma.invoice.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
        const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const outstandingAmount = invoices
          .filter((inv) => inv.status !== 'paid' && inv.status !== 'cancelled')
          .reduce((sum, inv) => sum + inv.total, 0);

        return {
          period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
          totalRevenue,
          totalInvoices: invoices.length,
          paidInvoices: paidInvoices.length,
          outstandingAmount,
          averageInvoiceValue: invoices.length > 0 ? totalRevenue / invoices.length : 0,
        };
      }
    );
  }

  /**
   * Get invoice
   */
  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });

    if (!invoice) {return null;}

    return {
      id: invoice.id,
      userId: invoice.userId,
      items: invoice.items as InvoiceItem[],
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      status: invoice.status as any,
      dueDate: invoice.dueDate,
      createdAt: invoice.createdAt,
      paidAt: invoice.paidAt || undefined,
    };
  }

  /**
   * Get user invoices
   */
  async getUserInvoices(userId: string): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map((invoice) => ({
      id: invoice.id,
      userId: invoice.userId,
      items: invoice.items as InvoiceItem[],
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      status: invoice.status as any,
      dueDate: invoice.dueDate,
      createdAt: invoice.createdAt,
      paidAt: invoice.paidAt || undefined,
    }));
  }

  /**
   * Cancel invoice
   */
  async cancelInvoice(invoiceId: string): Promise<void> {
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'cancelled' },
    });
  }

  /**
   * Refund payment
   */
  async refundPayment(invoiceId: string): Promise<{ success: boolean; error?: string }> {
    return BusinessLogicTracing.traceOperation(
      'billing.refund_payment',
      { invoiceId },
      async () => {
        const invoice = await this.prisma.invoice.findUnique({
          where: { id: invoiceId },
        });

        if (!invoice) {
          return { success: false, error: 'Invoice not found' };
        }

        if (invoice.status !== 'paid') {
          return { success: false, error: 'Invoice is not paid' };
        }

        try {
          // Refund with Stripe
          const refund = await this.stripe.refunds.create({
            payment_intent: invoice.transactionId,
          });

          if (refund.status === 'succeeded') {
            // Update invoice status
            await this.prisma.invoice.update({
              where: { id: invoiceId },
              data: { status: 'cancelled' },
            });

            return { success: true };
          } else {
            return { success: false, error: `Refund failed: ${refund.status}` };
          }
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      }
    );
  }

  /**
   * Cleanup
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export default BillingEngine;
