/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { EventEmitter } from 'events';
import type { RetailClient, BillingInformation } from '../interfaces';

/**
 * BILLING INTEGRATION SERVICE
 * 
 * Integrates with Azora Mint for payment processing:
 * - Subscription billing automation
 * - Usage-based pricing calculations
 * - Invoice generation and payment tracking
 * - Integration with Azora Mint billing engine
 */
export class BillingIntegrationService extends EventEmitter {
  private billingRecords: Map<string, BillingRecord[]> = new Map();
  private azoraMintEndpoint = process.env.AZORA_MINT_URL || 'http://localhost:3001';

  constructor() {
    super();
    this.startBillingCycle();
  }

  /**
   * Calculate monthly bill for client
   */
  async calculateMonthlyBill(clientId: string, client: RetailClient): Promise<BillingRecord> {
    const baseCharge = client.subscription.pricePerLocation * client.locations.length;
    
    // Calculate usage-based charges
    const usageCharges = await this.calculateUsageCharges(client);
    
    // Calculate overage fees (cameras beyond subscription limit)
    const overageCharges = await this.calculateOverageCharges(client);

    const totalAmount = baseCharge + usageCharges + overageCharges;
    const tax = totalAmount * 0.15; // 15% VAT
    const finalAmount = totalAmount + tax;

    const record: BillingRecord = {
      id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      period: {
        start: this.getStartOfMonth(),
        end: this.getEndOfMonth()
      },
      breakdown: {
        subscriptionFee: baseCharge,
        usageCharges,
        overageCharges,
        tax,
        total: finalAmount
      },
      status: 'pending',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      createdAt: new Date(),
      currency: client.billingInfo.currency
    };

    // Store billing record
    const records = this.billingRecords.get(clientId) || [];
    records.push(record);
    this.billingRecords.set(clientId, records);

    this.emit('billGenerated', record);

    return record;
  }

  /**
   * Process payment through Azora Mint
   */
  async processPayment(billId: string, paymentMethod: string): Promise<PaymentResult> {
    const record = this.findBillingRecord(billId);
    if (!record) {
      throw new Error('Billing record not found');
    }

    if (record.status === 'paid') {
      return {
        success: true,
        transactionId: record.paymentDetails!.transactionId,
        message: 'Already paid'
      };
    }

    try {
      // Call Azora Mint payment API
      const paymentResult = await this.callAzoraMint({
        clientId: record.clientId,
        amount: record.breakdown.total,
        currency: record.currency,
        paymentMethod,
        reference: `RETAIL_AI_${billId}`,
        metadata: {
          serviceType: 'retail-ai',
          billingPeriod: `${record.period.start.toISOString()}_${record.period.end.toISOString()}`
        }
      });

      if (paymentResult.success) {
        record.status = 'paid';
        record.paidAt = new Date();
        record.paymentDetails = {
          transactionId: paymentResult.transactionId,
          paymentMethod,
          paidAt: new Date()
        };

        this.emit('paymentProcessed', { billId, record });

        return paymentResult;
      } else {
        record.status = 'failed';
        this.emit('paymentFailed', { billId, record, error: paymentResult.error });
        
        return paymentResult;
      }
    } catch (error) {
      record.status = 'failed';
      this.emit('paymentFailed', { billId, record, error });
      
      return {
        success: false,
        message: 'Payment processing failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get billing history for client
   */
  async getBillingHistory(clientId: string, limit: number = 12): Promise<BillingRecord[]> {
    const records = this.billingRecords.get(clientId) || [];
    return records
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get outstanding bills
   */
  async getOutstandingBills(clientId: string): Promise<BillingRecord[]> {
    const records = this.billingRecords.get(clientId) || [];
    return records.filter(r => r.status === 'pending' && r.dueDate < new Date());
  }

  /**
   * Generate invoice PDF (placeholder)
   */
  async generateInvoice(billId: string): Promise<{ url: string; pdf: Buffer }> {
    const record = this.findBillingRecord(billId);
    if (!record) {
      throw new Error('Billing record not found');
    }

    // In production: generate actual PDF
    const invoiceUrl = `https://azora-retail-ai.com/invoices/${billId}.pdf`;
    
    this.emit('invoiceGenerated', { billId, url: invoiceUrl });

    return {
      url: invoiceUrl,
      pdf: Buffer.from('PDF_PLACEHOLDER')
    };
  }

  /**
   * Calculate revenue analytics
   */
  async getRevenueAnalytics(period: { start: Date; end: Date }): Promise<RevenueAnalytics> {
    const allRecords: BillingRecord[] = [];
    for (const records of this.billingRecords.values()) {
      allRecords.push(...records.filter(r => 
        r.period.start >= period.start && r.period.end <= period.end
      ));
    }

    const totalRevenue = allRecords
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + r.breakdown.total, 0);

    const pendingRevenue = allRecords
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.breakdown.total, 0);

    return {
      totalRevenue,
      pendingRevenue,
      paidInvoices: allRecords.filter(r => r.status === 'paid').length,
      pendingInvoices: allRecords.filter(r => r.status === 'pending').length,
      failedInvoices: allRecords.filter(r => r.status === 'failed').length,
      averageInvoiceValue: totalRevenue / allRecords.filter(r => r.status === 'paid').length || 0,
      bySubscriptionTier: this.groupByTier(allRecords)
    };
  }

  // Private helper methods

  private async calculateUsageCharges(client: RetailClient): Promise<number> {
    // Calculate charges based on data usage, API calls, etc.
    const totalCameras = client.locations.reduce((sum, loc) => sum + loc.cameras.length, 0);
    const baseUsage = totalCameras * 10; // $10 per camera data processing
    
    return baseUsage;
  }

  private async calculateOverageCharges(client: RetailClient): Promise<number> {
    const totalCameras = client.locations.reduce((sum, loc) => sum + loc.cameras.length, 0);
    const allowedCameras = client.subscription.maxCameras;
    
    if (totalCameras > allowedCameras) {
      const overage = totalCameras - allowedCameras;
      return overage * 50; // $50 per camera overage
    }
    
    return 0;
  }

  private async callAzoraMint(paymentData: any): Promise<PaymentResult> {
    // In production: actual HTTP call to Azora Mint
    // Simulating successful payment
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: 'Payment processed successfully'
    };
  }

  private findBillingRecord(billId: string): BillingRecord | null {
    for (const records of this.billingRecords.values()) {
      const record = records.find(r => r.id === billId);
      if (record) return record;
    }
    return null;
  }

  private getStartOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private getEndOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  private groupByTier(records: BillingRecord[]): Record<string, number> {
    // Simplified grouping
    return {
      basic: records.filter(r => r.breakdown.total < 500).length,
      professional: records.filter(r => r.breakdown.total >= 500 && r.breakdown.total < 2000).length,
      enterprise: records.filter(r => r.breakdown.total >= 2000).length
    };
  }

  private startBillingCycle(): void {
    // Run monthly billing on the 1st of each month
    setInterval(() => {
      const now = new Date();
      if (now.getDate() === 1) {
        this.emit('monthlyBillingCycle');
      }
    }, 24 * 60 * 60 * 1000); // Check daily
  }
}

// Type definitions

interface BillingRecord {
  id: string;
  clientId: string;
  period: {
    start: Date;
    end: Date;
  };
  breakdown: {
    subscriptionFee: number;
    usageCharges: number;
    overageCharges: number;
    tax: number;
    total: number;
  };
  status: 'pending' | 'paid' | 'failed' | 'overdue';
  dueDate: Date;
  createdAt: Date;
  paidAt?: Date;
  currency: string;
  paymentDetails?: {
    transactionId: string;
    paymentMethod: string;
    paidAt: Date;
  };
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  error?: string;
}

interface RevenueAnalytics {
  totalRevenue: number;
  pendingRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  failedInvoices: number;
  averageInvoiceValue: number;
  bySubscriptionTier: Record<string, number>;
}

export const billingIntegration = new BillingIntegrationService();
