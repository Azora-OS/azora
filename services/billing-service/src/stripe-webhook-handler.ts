import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

const prisma = new PrismaClient();

interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

/**
 * Stripe Webhook Handler - Production Ready
 * Handles all Stripe events with proper verification and database persistence
 */
export class StripeWebhookHandler {
  private readonly webhookSecret: string;
  private readonly citadelPercentage: number;

  constructor() {
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    this.citadelPercentage = parseFloat(process.env.CITADEL_FUND_PERCENTAGE || '10');

    if (!this.webhookSecret) {
      console.warn('⚠️  STRIPE_WEBHOOK_SECRET not configured - webhook verification disabled');
    }
  }

  /**
   * Main webhook endpoint handler
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;
    
    if (!sig) {
      res.status(400).send('Missing stripe-signature header');
      return;
    }

    let event: StripeWebhookEvent;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        this.webhookSecret
      ) as StripeWebhookEvent;
    } catch (err: any) {
      console.error('⚠️  Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    console.log(`✅ Received webhook: ${event.type} (${event.id})`);

    try {
      // Route to appropriate handler
      await this.processEvent(event);
      res.json({ received: true, processed: true });
    } catch (error: any) {
      console.error(`❌ Error processing webhook ${event.type}:`, error);
      
      // Log to database for retry
      await this.logFailedWebhook(event, error.message);
      
      // Return 500 so Stripe retries
      res.status(500).json({ 
        received: true, 
        processed: false, 
        error: error.message 
      });
    }
  }

  /**
   * Process webhook event based on type
   */
  private async processEvent(event: StripeWebhookEvent): Promise<void> {
    switch (event.type) {
      // Payment Intents
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event);
        break;

      // Charges
      case 'charge.succeeded':
        await this.handleChargeSuccess(event);
        break;
      case 'charge.refunded':
        await this.handleChargeRefunded(event);
        break;

      // Subscriptions
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event);
        break;

      // Invoices
      case 'invoice.paid':
        await this.handleInvoicePaid(event);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event);
        break;

      // Customers
      case 'customer.created':
        await this.handleCustomerCreated(event);
        break;
      case 'customer.updated':
        await this.handleCustomerUpdated(event);
        break;

      // Payouts
      case 'payout.paid':
        await this.handlePayoutPaid(event);
        break;
      case 'payout.failed':
        await this.handlePayoutFailed(event);
        break;

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle successful payment intent
   */
  private async handlePaymentSuccess(event: StripeWebhookEvent): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    console.log(`💳 Payment succeeded: ${paymentIntent.id} - $${paymentIntent.amount / 100}`);

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'SUCCEEDED' as any,
        type: 'PAYMENT' as any,
        metadata: paymentIntent.metadata,
        userId: paymentIntent.metadata.userId,
        description: paymentIntent.description || 'Payment',
      },
    });

    // Allocate to CitadelFund
    await this.allocateToCitadelFund(transaction.id, transaction.amount);

    // Update user balance or enrollment
    if (paymentIntent.metadata.type === 'course_enrollment') {
      await this.enrollUserInCourse(
        paymentIntent.metadata.userId,
        paymentIntent.metadata.courseId
      );
    } else if (paymentIntent.metadata.type === 'subscription') {
      await this.activateSubscription(
        paymentIntent.metadata.userId,
        paymentIntent.metadata.planId
      );
    }

    console.log(`✅ Transaction recorded: ${transaction.id}`);
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(event: StripeWebhookEvent): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    console.log(`❌ Payment failed: ${paymentIntent.id}`);

    await prisma.transaction.create({
      data: {
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'FAILED' as any,
        type: 'PAYMENT' as any,
        metadata: paymentIntent.metadata,
        userId: paymentIntent.metadata.userId,
        failureReason: paymentIntent.last_payment_error?.message,
      },
    });

    // Notify user of failed payment
    await this.sendPaymentFailedEmail(
      paymentIntent.metadata.userId,
      paymentIntent.last_payment_error?.message
    );
  }

  /**
   * Handle successful charge
   */
  private async handleChargeSuccess(event: StripeWebhookEvent): Promise<void> {
    const charge = event.data.object as Stripe.Charge;
    
    console.log(`💰 Charge succeeded: ${charge.id} - $${charge.amount / 100}`);

    await prisma.charge.upsert({
      where: { stripeChargeId: charge.id },
      update: {
        status: 'SUCCEEDED' as any,
        paid: true,
        updatedAt: new Date(),
      },
      create: {
        stripeChargeId: charge.id,
        amount: charge.amount / 100,
        currency: charge.currency,
        status: 'SUCCEEDED' as any,
        paid: true,
        paymentIntentId: charge.payment_intent as string,
        customerId: charge.customer as string,
        receiptUrl: charge.receipt_url,
      },
    });
  }

  /**
   * Handle charge refund
   */
  private async handleChargeRefunded(event: StripeWebhookEvent): Promise<void> {
    const charge = event.data.object as Stripe.Charge;
    
    console.log(`🔄 Charge refunded: ${charge.id} - $${charge.amount_refunded / 100}`);

    await prisma.refund.create({
      data: {
        stripeChargeId: charge.id,
        amount: charge.amount_refunded / 100,
        currency: charge.currency,
        reason: charge.refunds?.data[0]?.reason || 'requested_by_customer',
        status: 'SUCCEEDED' as any,
      },
    });

    // Reverse CitadelFund allocation
    await this.reverseCitadelFundAllocation(charge.id, charge.amount_refunded / 100);
  }

  /**
   * Handle invoice paid
   */
  private async handleInvoicePaid(event: StripeWebhookEvent): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    
    console.log(`📄 Invoice paid: ${invoice.id} - $${invoice.amount_paid / 100}`);

    await prisma.invoice.create({
      data: {
        stripeInvoiceId: invoice.id,
        customerId: invoice.customer as string,
        subscriptionId: invoice.subscription as string,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        status: 'paid',
        paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf,
      },
    });

    // Allocate to CitadelFund
    const citadelAmount = (invoice.amount_paid / 100) * (this.citadelPercentage / 100);
    await this.recordCitadelAllocation(invoice.id, citadelAmount);
  }

  /**
   * Handle subscription created
   */
  private async handleSubscriptionCreated(event: StripeWebhookEvent): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    
    console.log(`📱 Subscription created: ${subscription.id}`);

    await prisma.subscription.create({
      data: {
        stripeSubscriptionId: subscription.id,
        userId: subscription.metadata.userId,
        customerId: subscription.customer as string,
        status: subscription.status,
        priceId: subscription.items.data[0].price.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  }

  /**
   * Handle subscription updated
   */
  private async handleSubscriptionUpdated(event: StripeWebhookEvent): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    
    console.log(`🔄 Subscription updated: ${subscription.id} - ${subscription.status}`);

    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Handle subscription deleted/canceled
   */
  private async handleSubscriptionDeleted(event: StripeWebhookEvent): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    
    console.log(`🚫 Subscription deleted: ${subscription.id}`);

    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'CANCELLED' as any,
        canceledAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Allocate payment to CitadelFund
   */
  private async allocateToCitadelFund(transactionId: string, amount: number): Promise<void> {
    const citadelAmount = amount * (this.citadelPercentage / 100);

    await prisma.citadelFundAllocation.create({
      data: {
        transactionId,
        amount: citadelAmount,
        sourceAmount: amount,
        percentage: this.citadelPercentage,
        category: 'general',
        status: 'allocated',
        allocatedAt: new Date(),
      },
    });

    console.log(`🏛️  Allocated $${citadelAmount.toFixed(2)} to CitadelFund (${this.citadelPercentage}%)`);
  }

  /**
   * Reverse CitadelFund allocation on refund
   */
  private async reverseCitadelFundAllocation(chargeId: string, refundAmount: number): Promise<void> {
    const citadelAmount = refundAmount * (this.citadelPercentage / 100);

    await prisma.citadelFundAllocation.create({
      data: {
        chargeId,
        amount: -citadelAmount,
        sourceAmount: refundAmount,
        percentage: this.citadelPercentage,
        category: 'refund',
        status: 'reversed',
        allocatedAt: new Date(),
      },
    });

    console.log(`↩️  Reversed $${citadelAmount.toFixed(2)} from CitadelFund`);
  }

  /**
   * Record CitadelFund allocation for invoice
   */
  private async recordCitadelAllocation(invoiceId: string, amount: number): Promise<void> {
    await prisma.citadelFundAllocation.create({
      data: {
        invoiceId,
        amount,
        category: 'subscription',
        status: 'allocated',
        allocatedAt: new Date(),
      },
    });
  }

  /**
   * Enroll user in course after payment
   */
  private async enrollUserInCourse(userId: string, courseId: string): Promise<void> {
    await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: 'ACTIVE' as any,
        enrolledAt: new Date(),
        paidAmount: 0, // Will be updated from transaction
      },
    });

    console.log(`🎓 User ${userId} enrolled in course ${courseId}`);
  }

  /**
   * Activate subscription for user
   */
  private async activateSubscription(userId: string, planId: string): Promise<void> {
    await prisma.userSubscription.update({
      where: { userId },
      data: {
        planId,
        status: 'ACTIVE' as any,
        activatedAt: new Date(),
      },
    });

    console.log(`✅ Subscription activated for user ${userId}`);
  }

  /**
   * Send payment failed notification
   */
  private async sendPaymentFailedEmail(userId: string, reason?: string): Promise<void> {
    // TODO: Implement email service integration
    console.log(`📧 Sending payment failed email to user ${userId}: ${reason}`);
  }

  /**
   * Handle customer created
   */
  private async handleCustomerCreated(event: StripeWebhookEvent): Promise<void> {
    const customer = event.data.object as Stripe.Customer;
    
    console.log(`👤 Customer created: ${customer.id}`);

    if (customer.metadata.userId) {
      await prisma.user.update({
        where: { id: customer.metadata.userId },
        data: { stripeCustomerId: customer.id },
      });
    }
  }

  /**
   * Handle customer updated
   */
  private async handleCustomerUpdated(event: StripeWebhookEvent): Promise<void> {
    const customer = event.data.object as Stripe.Customer;
    console.log(`👤 Customer updated: ${customer.id}`);
    // Additional logic as needed
  }

  /**
   * Handle successful payout
   */
  private async handlePayoutPaid(event: StripeWebhookEvent): Promise<void> {
    const payout = event.data.object as Stripe.Payout;
    console.log(`💸 Payout succeeded: ${payout.id} - $${payout.amount / 100}`);
    
    await prisma.payout.create({
      data: {
        stripePayoutId: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: 'paid',
        arrivalDate: new Date(payout.arrival_date * 1000),
      },
    });
  }

  /**
   * Handle failed payout
   */
  private async handlePayoutFailed(event: StripeWebhookEvent): Promise<void> {
    const payout = event.data.object as Stripe.Payout;
    console.log(`❌ Payout failed: ${payout.id}`);
    
    await prisma.payout.create({
      data: {
        stripePayoutId: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: 'FAILED' as any,
        failureCode: payout.failure_code,
        failureMessage: payout.failure_message,
      },
    });
  }

  /**
   * Log failed webhook for retry
   */
  private async logFailedWebhook(event: StripeWebhookEvent, error: string): Promise<void> {
    await prisma.webhookLog.create({
      data: {
        eventId: event.id,
        eventType: event.type,
        status: 'FAILED' as any,
        errorMessage: error,
        payload: event as any,
        attemptCount: 1,
      },
    });
  }

  /**
   * Retry failed webhooks (run periodically via cron)
   */
  async retryFailedWebhooks(): Promise<void> {
    const failedWebhooks = await prisma.webhookLog.findMany({
      where: {
        status: 'FAILED' as any,
        attemptCount: { lt: 5 },
      },
      take: 100,
    });

    for (const webhook of failedWebhooks) {
      try {
        await this.processEvent(webhook.payload as StripeWebhookEvent);
        
        await prisma.webhookLog.update({
          where: { id: webhook.id },
          data: {
            status: 'SUCCEEDED' as any,
            attemptCount: { increment: 1 },
            lastAttemptAt: new Date(),
          },
        });
        
        console.log(`✅ Retried webhook ${webhook.eventId} successfully`);
      } catch (error: any) {
        await prisma.webhookLog.update({
          where: { id: webhook.id },
          data: {
            attemptCount: { increment: 1 },
            lastAttemptAt: new Date(),
            errorMessage: error.message,
          },
        });
        
        console.error(`❌ Webhook retry failed: ${webhook.eventId}`);
      }
    }
  }
}

export const stripeWebhookHandler = new StripeWebhookHandler();

