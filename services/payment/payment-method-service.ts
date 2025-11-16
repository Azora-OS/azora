/**
 * Payment Method Service
 * Manages payment methods for users
 */

import { logger } from '../shared/logging';
import StripeClientService from './stripe-client';
import { PaymentError } from './types';

export interface PaymentMethodData {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  type: string;
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: Date;
}

export class PaymentMethodService {
  constructor(private stripeClient: StripeClientService) {}

  /**
   * Create a payment method
   */
  async createPaymentMethod(
    userId: string,
    type: string,
    details: Record<string, any>
  ): Promise<PaymentMethodData> {
    try {
      logger.info('Creating payment method', { userId, type });

      const result = await this.stripeClient.createPaymentMethod(type, details);

      if (!result.success) {
        throw new PaymentError('Failed to create payment method', 'STRIPE_ERROR');
      }

      // Extract payment method details
      const paymentMethod = await this.stripeClient.retrievePaymentMethod(
        result.paymentMethodId
      );

      const paymentMethodData: PaymentMethodData = {
        id: result.paymentMethodId,
        userId,
        stripePaymentMethodId: result.paymentMethodId,
        type,
        last4: this.extractLast4(paymentMethod),
        brand: this.extractBrand(paymentMethod),
        expiryMonth: this.extractExpiryMonth(paymentMethod),
        expiryYear: this.extractExpiryYear(paymentMethod),
        isDefault: false,
        createdAt: new Date(),
      };

      logger.info('Payment method created successfully', {
        paymentMethodId: result.paymentMethodId,
      });

      return paymentMethodData;
    } catch (error) {
      logger.error('Failed to create payment method', { error, userId, type });
      throw error instanceof PaymentError
        ? error
        : new PaymentError('Failed to create payment method', 'UNKNOWN_ERROR');
    }
  }

  /**
   * Retrieve a payment method
   */
  async retrievePaymentMethod(paymentMethodId: string): Promise<PaymentMethodData> {
    try {
      logger.info('Retrieving payment method', { paymentMethodId });

      const paymentMethod = await this.stripeClient.retrievePaymentMethod(
        paymentMethodId
      );

      const paymentMethodData: PaymentMethodData = {
        id: paymentMethod.id,
        userId: '', // Would need to be fetched from database
        stripePaymentMethodId: paymentMethod.id,
        type: paymentMethod.type,
        last4: this.extractLast4(paymentMethod),
        brand: this.extractBrand(paymentMethod),
        expiryMonth: this.extractExpiryMonth(paymentMethod),
        expiryYear: this.extractExpiryYear(paymentMethod),
        isDefault: false,
        createdAt: new Date(paymentMethod.created * 1000),
      };

      logger.info('Payment method retrieved successfully', { paymentMethodId });

      return paymentMethodData;
    } catch (error) {
      logger.error('Failed to retrieve payment method', { error, paymentMethodId });
      throw error instanceof PaymentError
        ? error
        : new PaymentError('Failed to retrieve payment method', 'UNKNOWN_ERROR');
    }
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      logger.info('Deleting payment method', { paymentMethodId });

      await this.stripeClient.detachPaymentMethod(paymentMethodId);

      logger.info('Payment method deleted successfully', { paymentMethodId });
    } catch (error) {
      logger.error('Failed to delete payment method', { error, paymentMethodId });
      throw error instanceof PaymentError
        ? error
        : new PaymentError('Failed to delete payment method', 'UNKNOWN_ERROR');
    }
  }

  /**
   * Extract last 4 digits from payment method
   */
  private extractLast4(paymentMethod: any): string {
    if (paymentMethod.card?.last4) {
      return paymentMethod.card.last4;
    }
    if (paymentMethod.us_bank_account?.last4) {
      return paymentMethod.us_bank_account.last4;
    }
    return '';
  }

  /**
   * Extract brand from payment method
   */
  private extractBrand(paymentMethod: any): string | undefined {
    return paymentMethod.card?.brand;
  }

  /**
   * Extract expiry month from payment method
   */
  private extractExpiryMonth(paymentMethod: any): number | undefined {
    return paymentMethod.card?.exp_month;
  }

  /**
   * Extract expiry year from payment method
   */
  private extractExpiryYear(paymentMethod: any): number | undefined {
    return paymentMethod.card?.exp_year;
  }

  /**
   * Validate payment method details
   */
  validatePaymentMethodDetails(type: string, details: Record<string, any>): boolean {
    if (type === 'card') {
      return (
        details.card?.number &&
        details.card?.exp_month &&
        details.card?.exp_year &&
        details.card?.cvc
      );
    }

    if (type === 'us_bank_account') {
      return (
        details.us_bank_account?.account_number &&
        details.us_bank_account?.routing_number
      );
    }

    return false;
  }
}

export default PaymentMethodService;
