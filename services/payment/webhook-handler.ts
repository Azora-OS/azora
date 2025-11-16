/**
 * Webhook Handler Service
 * Processes Stripe webhook events
 */

import Stripe from 'stripe';
import { logger } from '../shared/logging';
import PaymentRepository from './payment-repository';
import StripeClientService from './stripe-client';
import { PaymentStatus, PaymentError } from './types';

export class WebhookHandler {
  constructor(
    private stripeClient: StripeClientService,
    private paymentRepository: PaymentRepository
  ) {}

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    body: string,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    try {
      logger.info('Verifying webhook signature');

      const event = this.stripeClient.verifyWebhookSignature(
        body,
        signature,
        webhookSecret
      );

      logger.info('Webhook signature verified', { eventType: event.type });
      return event;
    } catch (error) {
      logger.error('Webhook signature verification failed', { error });
      throw new PaymentError('Invalid webhook signature', 'INVALID_SIGNATURE');
    }
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      logger.info('Processing webhook event', { eventType: event.type });

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentPaymentFailed(event);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event);
          break;

        default:
          logger.info('Unhandled webhook event type', { eventType: event.type });
      }

      logger.info('Webhook event processed successfully', { eventType: event.type });
    } catch (error) {
      logger.error('Failed to process webhook event', { error, eventType: event.type });
      throw error;
    }
  }

  /**
   * Handle payment_intent.succeeded event
   */
  private async handlePaymentIntentSucceeded(event: Stripe.Event): Promise<void> {
    try {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      logger.info('Handling payment_intent.succeeded', {
        paymentIntentId: paymentIntent.id,
      });

      // Find payment by Stripe ID
      const payment = await this.paymentRepository.getPaymentByStripeId(
        paymentIntent.id
      );

      if (!payment) {
        logger.warn('Payment not found for succeeded event', {
          paymentIntentId: paymentIntent.id,
        });
        return;
      }

      // Update payment status
      await this.paymentRepository.updatePayment(payment.id, {
        status: PaymentStatus.SUCCEEDED,
      } as any);

      logger.info('Payment status updated to succeeded', { paymentId: payment.id });

      // TODO: Trigger downstream actions (send receipt email, grant access, etc.)
    } catch (error) {
      logger.error('Failed to handle payment_intent.succeeded', { error });
      throw error;
    }
  }

  /**
   * Handle payment_intent.payment_failed event
   */
  private async handlePaymentIntentPaymentFailed(event: Stripe.Event): Promise<void> {
    try {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      logger.info('Handling payment_intent.payment_failed', {
        paymentIntentId: paymentIntent.id,
      });

      // Find payment by Stripe ID
      const payment = await this.paymentRepository.getPaymentByStripeId(
        paymentIntent.id
      );

      if (!payment) {
        logger.warn('Payment not found for failed event', {
          paymentIntentId: paymentIntent.id,
        });
        return;
      }

      // Extract error information
      const errorCode = (paymentIntent.last_payment_error as any)?.code || 'unknown';
      const errorMessage =
        (paymentIntent.last_payment_error as any)?.message || 'Payment failed';

      // Update payment status
      await this.paymentRepository.updatePayment(payment.id, {
        status: PaymentStatus.FAILED,
        errorCode,
        errorMessage,
      } as any);

      logger.info('Payment status updated to failed', {
        paymentId: payment.id,
        errorCode,
      });

      // TODO: Trigger downstream actions (send failure notification, etc.)
    } catch (error) {
      logger.error('Failed to handle payment_intent.payment_failed', { error });
      throw error;
    }
  }

  /**
   * Handle charge.refunded event
   */
  private async handleChargeRefunded(event: Stripe.Event): Promise<void> {
    try {
      const charge = event.data.object as Stripe.Charge;

      logger.info('Handling charge.refunded', {
        chargeId: charge.id,
        paymentIntentId: charge.payment_intent,
      });

      if (!charge.payment_intent) {
        logger.warn('No payment intent associated with refunded charge', {
          chargeId: charge.id,
        });
        return;
      }

      // Find payment by Stripe ID
      const payment = await this.paymentRepository.getPaymentByStripeId(
        charge.payment_intent as string
      );

      if (!payment) {
        logger.warn('Payment not found for refunded charge', {
          paymentIntentId: charge.payment_intent,
        });
        return;
      }

      // Update payment status
      await this.paymentRepository.updatePayment(payment.id, {
        status: PaymentStatus.REFUNDED,
        refundedAmount: charge.amount_refunded,
      } as any);

      logger.info('Payment status updated to refunded', {
        paymentId: payment.id,
        refundedAmount: charge.amount_refunded,
      });

      // TODO: Trigger downstream actions (send refund notification, etc.)
    } catch (error) {
      logger.error('Failed to handle charge.refunded', { error });
      throw error;
    }
  }
}

export default WebhookHandler;
