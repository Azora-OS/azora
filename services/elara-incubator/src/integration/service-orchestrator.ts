import { businessService } from '../services/business.service.js';
import { revenueService } from '../services/revenue.service.js';
import { paymentService } from '../services/payment.service.js';
import { fundService } from '../services/fund.service.js';
import { allocationService } from '../services/allocation.service.js';
import { legalService } from '../services/legal.service.js';
import { documentGenerationService } from '../services/document-generation.service.js';
import { notificationService } from '../services/notification.service.js';
import { auditService } from '../services/audit.service.js';
import { elaraAIService } from '../services/elara-ai.service.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Service Orchestrator - Coordinates all services for complex workflows
 */
export class ServiceOrchestrator {
  /**
   * Complete business creation workflow
   * Integrates: Business, Legal, Elara AI, Audit
   */
  async createBusinessWithLegalSetup(
    userId: string,
    businessData: {
      businessName: string;
      businessType: string;
      templateId: string;
    }
  ) {
    try {
      // 1. Create business
      const business = await businessService.createBusiness(userId, businessData);

      // 2. Get Elara AI guidance
      const guidance = await elaraAIService.getBusinessGuidance(
        businessData.businessType,
        'business_creation'
      );

      // 3. Generate legal documents
      const legalDocs = await legalService.generateBusinessDocuments(business.id, {
        businessName: business.businessName,
        ownerName: userId,
        userOwnership: 90,
        citadelFundShare: 10,
      });

      // 4. Log audit trail
      await auditService.logAction({
        action: 'BUSINESS_CREATED',
        userId,
        details: `Business ${business.businessName} created with legal documents`,
        timestamp: new Date(),
      });

      // 5. Send notification
      await notificationService.sendNotification(userId, {
        type: 'business_created',
        title: 'Business Created Successfully',
        message: `Your business ${business.businessName} has been created. Please review and sign the legal documents.`,
      });

      return {
        business,
        legalDocuments: legalDocs,
        guidance,
      };
    } catch (error) {
      await auditService.logAction({
        action: 'BUSINESS_CREATION_FAILED',
        userId,
        details: `Failed to create business: ${error}`,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Complete revenue processing workflow
   * Integrates: Revenue, Payment, Fund, Allocation, Notification, Audit
   */
  async processRevenueWithAllocation(
    businessId: string,
    revenueData: {
      amount: number;
      currency: string;
      source: string;
    }
  ) {
    try {
      // 1. Record revenue transaction
      const transaction = await revenueService.recordTransaction(businessId, revenueData);

      // 2. Calculate allocation (90/10 split)
      const allocation = await allocationService.allocateRevenue(
        transaction.id,
        transaction.amount
      );

      // 3. Create payment for business owner (90%)
      const ownerPayment = await paymentService.createPayment(businessId, '', {
        amount: allocation.businessOwnerAmount,
        type: 'revenue',
        paymentMethod: 'automatic',
      });

      // 4. Record Citadel Fund contribution (10%)
      await fundService.recordContribution(allocation.citadelFundAmount, businessId);

      // 5. Log audit trail
      await auditService.logAction({
        action: 'REVENUE_PROCESSED',
        userId: businessId,
        details: `Revenue ${revenueData.amount} processed with allocation`,
        timestamp: new Date(),
      });

      // 6. Send notifications
      await notificationService.sendNotification(businessId, {
        type: 'revenue_received',
        title: 'Revenue Received',
        message: `Revenue of $${revenueData.amount} received. Your share: $${allocation.businessOwnerAmount.toFixed(2)}`,
      });

      return {
        transaction,
        allocation,
        ownerPayment,
      };
    } catch (error) {
      await auditService.logAction({
        action: 'REVENUE_PROCESSING_FAILED',
        userId: businessId,
        details: `Failed to process revenue: ${error}`,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Complete payment processing workflow
   * Integrates: Payment, Notification, Audit
   */
  async processPaymentWithNotification(
    businessId: string,
    paymentId: string,
    userId: string
  ) {
    try {
      // 1. Confirm payment
      const payment = await paymentService.confirmPayment(paymentId, userId);

      // 2. Log audit trail
      await auditService.logAction({
        action: 'PAYMENT_CONFIRMED',
        userId,
        details: `Payment ${paymentId} confirmed for $${payment.amount}`,
        timestamp: new Date(),
      });

      // 3. Send notification
      await notificationService.sendNotification(userId, {
        type: 'payment_confirmed',
        title: 'Payment Confirmed',
        message: `Payment of $${payment.amount} has been confirmed and processed.`,
      });

      return payment;
    } catch (error) {
      await auditService.logAction({
        action: 'PAYMENT_CONFIRMATION_FAILED',
        userId,
        details: `Failed to confirm payment: ${error}`,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Complete document signing workflow
   * Integrates: Legal, Document Generation, Audit, Notification
   */
  async signBusinessDocuments(
    businessId: string,
    userId: string,
    documentIds: string[],
    signatureData: {
      signatureHash: string;
      ipAddress: string;
      userAgent: string;
    }
  ) {
    try {
      const signedDocuments = [];

      // 1. Sign each document
      for (const docId of documentIds) {
        const signedDoc = await legalService.signDocument(businessId, docId, {
          documentId: docId,
          signatureHash: signatureData.signatureHash,
        });
        signedDocuments.push(signedDoc);
      }

      // 2. Log audit trail
      await auditService.logAction({
        action: 'DOCUMENTS_SIGNED',
        userId,
        details: `${documentIds.length} documents signed for business ${businessId}`,
        timestamp: new Date(),
      });

      // 3. Send notification
      await notificationService.sendNotification(userId, {
        type: 'documents_signed',
        title: 'Documents Signed',
        message: `${documentIds.length} legal documents have been successfully signed.`,
      });

      return signedDocuments;
    } catch (error) {
      await auditService.logAction({
        action: 'DOCUMENT_SIGNING_FAILED',
        userId,
        details: `Failed to sign documents: ${error}`,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Complete Citadel Fund distribution workflow
   * Integrates: Fund, Payment, Notification, Audit
   */
  async distributeCitadelFund(
    distributionAmount: number,
    distributionType: 'scholarship' | 'project' | 'community_initiative'
  ) {
    try {
      // 1. Check fund balance
      const fund = await fundService.getFundBalance();
      if (fund.balance < distributionAmount) {
        throw new AppError(400, 'Insufficient fund balance');
      }

      // 2. Process distribution
      const distribution = await fundService.distributeFromFund(
        distributionAmount,
        distributionType
      );

      // 3. Log audit trail
      await auditService.logAction({
        action: 'FUND_DISTRIBUTED',
        userId: 'admin',
        details: `Citadel Fund distribution of $${distributionAmount} for ${distributionType}`,
        timestamp: new Date(),
      });

      // 4. Send notification to admins
      await notificationService.sendNotification('admin', {
        type: 'fund_distributed',
        title: 'Citadel Fund Distributed',
        message: `$${distributionAmount} distributed for ${distributionType}`,
      });

      return distribution;
    } catch (error) {
      await auditService.logAction({
        action: 'FUND_DISTRIBUTION_FAILED',
        userId: 'admin',
        details: `Failed to distribute fund: ${error}`,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Get complete business dashboard data
   * Integrates: Business, Revenue, Payment, Fund, Elara AI
   */
  async getBusinessDashboardData(businessId: string) {
    try {
      const [business, revenue, payments, fund, mentorship] = await Promise.all([
        businessService.getBusinessById(businessId),
        revenueService.getStatistics(businessId),
        paymentService.getPaymentHistory(businessId),
        fundService.getFundBalance(),
        elaraAIService.getMentorshipSessions(businessId),
      ]);

      return {
        business,
        revenue,
        payments,
        fund,
        mentorship,
      };
    } catch (error) {
      throw new AppError(500, `Failed to get dashboard data: ${error}`);
    }
  }
}

export const serviceOrchestrator = new ServiceOrchestrator();
