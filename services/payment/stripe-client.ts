/**
 * Stripe Client Service
 * Handles all Stripe API interactions for payment processing
 */

import Stripe from 'stripe';
import { logger } from '../shared/logging';
import { PaymentError, PaymentIntentResult, RefundResult } from './types';

export class StripeClientService {
  private stripe: Stripe;
  private readonly apiVersion = '2023-10-16';

  constructor(secretKey: string) {
    if (!secretKey) {
      throw new Error('Stripe secret key is required');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: this.apiVersion as any,
      typescript: true,
    });
  }

  /**
   * Create a Payment Intent for processing payments
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
    idempotencyKey: string
  ): Promise<PaymentIntentResult> {
    try {
      logger.info('Creating Stripe Payment Intent', {
        amount,
        currency,
        idempotencyKey,
      });

      const paymentIntent = await this.stripe.paymentIntents.create(
        {
          amount,
          currency,
          metadata,
          automatic_payment_methods: {
            enabled: true,
          },
        },
        {
          idempotencyKey,
        }
      );

      logger.info('Payment Intent created successfully', {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      });

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      const paymentError = this.handleStripeError(error);
      logger.error('Failed to create Payment Intent', {
        error: paymentError,
        amount,
        currency,
      });
      throw paymentError;
    }
  }

  /**
   * Retrieve a Payment Intent by ID
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntentResult> {
    try {
      logger.info('Retrieving Payment Intent', { paymentIntentId });

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      const paymentError = this.handleStripeError(error);
      logger.error('Failed to retrieve Payment Intent', {
        error: paymentError,
        paymentIntentId,
      });
      throw paymentError;
    }
  }

  /**
   * Create a Payment Method for storing card details
   */
  async createPaymentMethod(
    type: string,
    details: Record<string, any>
  ): Promise<{ success: boolean; paymentMethodId: string }> {
    try {
      logger.info('Creating Payment Method', { type });

      const paymentMethod = await this.stripe.paymentMethods.create({
        type: type as any,
        ...details,
      });

      logger.info('Payment Method created successfully', {
        paymentMethodId: paymentMethod.id,
      });

      return {
        success: true,
        paymentMethodId: paymentMethod.id,
      };
    } catch (error) {
      const paymentError = this.handleStripeError(error);
      logger.error('Failed to create Payment Method', {
        error: paymentError,
        type,
      });
      throw paymentError;
    }
  }

  /**
   * Retrieve a Payment Method by ID
   */
  async retrievePaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      logger.info('Retrieving Payment Method', { paymentMethodId });

      const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);

      return paymentMethod;
    } catch (error) {
      const paymentError = this.handleStripeError(error);
      logger.error('Failed to retrieve Payment Method', {
        error: paymentError,
        paymentMethodId,
      });
      throw paymentError;
    }
  }

  /**
   * Detach a Payment Method (delete)
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      logger.info('Detaching Payment Method', { paymentMethodId });

      await this.stripe.paymentMethods.detach(paymentMethodId);

      logger.info('Payment Method detached successfully', { paymentMethodId });
    } catch (error) {
      const paymentError = this.handleStripeError(error);
      logger.error('Failed to detach Payment Method', {
        error: paymentError,
        paymentMethodId,
      });
      throw paymentError;
    }
  }

  /**
   * Create a Refund for a Payment Intent
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number
  ): Promise<RefundResult> {
    try {
      logger.info('Creating refund', {
        paymentIntentId,
        amount,
      });

      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
      });

      logger.info('Refund created successfully', {
        refundId: refund.id,
        status: refund.status,
      });

      return {
        success: true,
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount,
      };
    } catch (error) {
      const paymentError = this.handleStripeError(error);
      logger.error('Failed to create refund', {
        error: paymentError,
        paymentIntentId,
      });
      throw paymentError;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    body: string,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    try {
      const event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logger.info('Webhook signature verified', { eventType: event.type });
      return event;
    } catch (error) {
      logger.error('Webhook signature verification failed', { error });
      throw new PaymentError('Invalid webhook signature', 'INVALID_SIGNATURE');
    }
  }

  /**
   * Handle Stripe errors and convert to PaymentError
   */
  private handleStripeError(error: any): PaymentError {
    if (error instanceof Stripe.errors.StripeError) {
      const stripeError = error as Stripe.errors.StripeError;

      logger.error('Stripe API error', {
        type: stripeError.type,
        code: (stripeError as any).code,
        message: stripeError.message,
      });

      // Map Stripe error codes to PaymentError
      const errorCode = (stripeError as any).code || 'STRIPE_ERROR';
      const errorMessage = this.getErrorMessage(errorCode);

      return new PaymentError(errorMessage, errorCode);
    }

    logger.error('Unexpected error in Stripe client', { error });
    return new PaymentError('An unexpected error occurred', 'UNKNOWN_ERROR');
  }

  /**
   * Get user-friendly error message for Stripe error codes
   */
  private getErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
      card_declined: 'Your card was declined. Please try another payment method.',
      insufficient_funds: 'Insufficient funds. Please check your account balance.',
      expired_card: 'Your card has expired. Please use a different card.',
      incorrect_cvc: 'The CVC code is incorrect. Please try again.',
      processing_error: 'A processing error occurred. Please try again later.',
      rate_limit: 'Too many requests. Please try again in a moment.',
      authentication_error: 'Authentication failed. Please check your credentials.',
      invalid_request_error: 'Invalid request. Please check your input.',
      api_error: 'An API error occurred. Please try again later.',
      INVALID_SIGNATURE: 'Invalid webhook signature.',
      UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    };

    return errorMessages[code] || 'An error occurred. Please try again.';
  }
}

export default StripeClientService;
