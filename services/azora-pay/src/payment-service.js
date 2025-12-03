/**
 * Azora Payment Service
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const { metrics } = require('../../../shared/monitoring/metrics');
const { getLogger } = require('../../../shared/monitoring/logger');

const prisma = new PrismaClient();
const logger = getLogger('azora-pay');

class PaymentService {
  constructor() {
    this.stripe = stripe;
    this.logger = logger;
  }

  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        metadata: {
          ...metadata,
          ubuntu: 'My security ensures our freedom'
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      // Track metrics
      metrics.incrementCounter('payment_intents_created_total', 1, {
        currency,
        status: 'created'
      });

      this.logger.info('Payment intent created', {
        paymentIntentId: paymentIntent.id,
        amount,
        currency,
        metadata
      });

      return paymentIntent;
    } catch (error) {
      this.logger.error('Failed to create payment intent', { error, amount, currency });
      metrics.incrementCounter('payment_intents_failed_total', 1, {
        error: error.type
      });
      throw error;
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        await this.recordSuccessfulPayment(paymentIntent);
        
        metrics.incrementCounter('payments_completed_total', 1, {
          currency: paymentIntent.currency,
          amount: paymentIntent.amount.toString()
        });

        this.logger.info('Payment confirmed successfully', {
          paymentIntentId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        });
      }

      return paymentIntent;
    } catch (error) {
      this.logger.error('Failed to confirm payment', { error, paymentIntentId });
      throw error;
    }
  }

  async createCustomer(userId, email, name) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
          ubuntu: 'Azora community member'
        }
      });

      // Save customer to database
      await prisma.paymentCustomer.create({
        data: {
          userId,
          stripeCustomerId: customer.id,
          email
        }
      });

      this.logger.info('Customer created', { userId, customerId: customer.id });
      return customer;
    } catch (error) {
      this.logger.error('Failed to create customer', { error, userId, email });
      throw error;
    }
  }

  async createSubscription(customerId, priceId, trialPeriodDays = 0) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: trialPeriodDays,
        metadata: {
          ubuntu: 'Community subscription'
        }
      });

      await this.recordSubscription(subscription);

      metrics.incrementCounter('subscriptions_created_total', 1, {
        status: 'active'
      });

      this.logger.info('Subscription created', {
        subscriptionId: subscription.id,
        customerId,
        priceId
      });

      return subscription;
    } catch (error) {
      this.logger.error('Failed to create subscription', { error, customerId, priceId });
      throw error;
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);

      await this.updateSubscriptionStatus(subscriptionId, 'canceled');

      metrics.incrementCounter('subscriptions_canceled_total', 1);

      this.logger.info('Subscription canceled', { subscriptionId });
      return subscription;
    } catch (error) {
      this.logger.error('Failed to cancel subscription', { error, subscriptionId });
      throw error;
    }
  }

  async refundPayment(paymentIntentId, reason = 'requested_by_customer') {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason,
        metadata: {
          ubuntu: 'Community refund'
        }
      });

      await this.recordRefund(refund);

      metrics.incrementCounter('refunds_created_total', 1, {
        reason
      });

      this.logger.info('Refund created', {
        refundId: refund.id,
        paymentIntentId,
        amount: refund.amount,
        reason
      });

      return refund;
    } catch (error) {
      this.logger.error('Failed to create refund', { error, paymentIntentId, reason });
      throw error;
    }
  }

  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSuccess(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailure(event.data.object);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        default:
          this.logger.warn('Unhandled webhook event', { eventType: event.type });
      }

      this.logger.info('Webhook processed', { eventType: event.type });
    } catch (error) {
      this.logger.error('Failed to process webhook', { error, eventType: event.type });
      throw error;
    }
  }

  async getPaymentHistory(userId, limit = 10, offset = 0) {
    try {
      const payments = await prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return payments;
    } catch (error) {
      this.logger.error('Failed to get payment history', { error, userId });
      throw error;
    }
  }

  async getCustomerSubscriptions(userId) {
    try {
      const customer = await prisma.paymentCustomer.findUnique({
        where: { userId }
      });

      if (!customer) {
        return [];
      }

      const subscriptions = await this.stripe.subscriptions.list({
        customer: customer.stripeCustomerId,
        status: 'active'
      });

      return subscriptions.data;
    } catch (error) {
      this.logger.error('Failed to get customer subscriptions', { error, userId });
      throw error;
    }
  }

  // Private helper methods
  private async recordSuccessfulPayment(paymentIntent) {
    await prisma.payment.create({
      data: {
        userId: paymentIntent.metadata.userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'completed',
        metadata: paymentIntent.metadata
      }
    });
  }

  private async recordSubscription(subscription) {
    await prisma.subscription.create({
      data: {
        userId: subscription.metadata.userId,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        metadata: subscription.metadata
      }
    });
  }

  private async updateSubscriptionStatus(subscriptionId, status) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status }
    });
  }

  private async recordRefund(refund) {
    await prisma.refund.create({
      data: {
        stripeRefundId: refund.id,
        paymentIntentId: refund.payment_intent,
        amount: refund.amount / 100,
        currency: refund.currency,
        reason: refund.reason,
        status: refund.status,
        metadata: refund.metadata
      }
    });
  }

  private async handlePaymentSuccess(paymentIntent) {
    await this.recordSuccessfulPayment(paymentIntent);
    metrics.incrementCounter('webhook_payment_success_total', 1);
  }

  private async handlePaymentFailure(paymentIntent) {
    metrics.incrementCounter('webhook_payment_failure_total', 1);
    this.logger.warn('Payment failed', { paymentIntentId: paymentIntent.id });
  }

  private async handleInvoicePaymentSuccess(invoice) {
    metrics.incrementCounter('webhook_invoice_success_total', 1);
  }

  private async handleInvoicePaymentFailure(invoice) {
    metrics.incrementCounter('webhook_invoice_failure_total', 1);
    this.logger.warn('Invoice payment failed', { invoiceId: invoice.id });
  }

  private async handleSubscriptionCreated(subscription) {
    await this.recordSubscription(subscription);
    metrics.incrementCounter('webhook_subscription_created_total', 1);
  }

  private async handleSubscriptionDeleted(subscription) {
    await this.updateSubscriptionStatus(subscription.id, 'canceled');
    metrics.incrementCounter('webhook_subscription_deleted_total', 1);
  }
}

module.exports = { PaymentService };
