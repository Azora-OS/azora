/**
 * Payment Service Types
 * Defines all types and interfaces for payment processing
 */

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentType {
  COURSE_PURCHASE = 'course_purchase',
  SUBSCRIPTION = 'subscription',
  MARKETPLACE = 'marketplace',
}

export interface PaymentIntentResult {
  success: boolean;
  paymentIntentId: string;
  clientSecret: string | null;
  status: string;
  amount: number;
  currency: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  status: string;
  amount: number;
}

export interface PaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  courseId?: string;
  subscriptionTierId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentData {
  userId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodId?: string;
  courseId?: string;
  subscriptionTierId?: string;
  metadata: Record<string, string>;
  idempotencyKey: string;
  receiptId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface Payment extends PaymentData {
  id: string;
  refundedAmount?: number;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptData {
  id: string;
  paymentId: string;
  userId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  items: ReceiptItem[];
  pdfUrl: string;
  emailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IdempotencyKeyData {
  id: string;
  key: string;
  userId: string;
  paymentResult: PaymentIntentResult;
  expiresAt: Date;
  createdAt: Date;
}

export interface PaginatedPayments {
  payments: Payment[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  stripePaymentIntentId?: string;
  status?: PaymentStatus;
  clientSecret?: string;
  error?: PaymentError;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface PaymentStatus {
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Custom Payment Error class
 */
export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

/**
 * Webhook event types
 */
export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

export interface PaymentIntentSucceededEvent extends WebhookEvent {
  type: 'payment_intent.succeeded';
  data: {
    object: {
      id: string;
      status: string;
      amount: number;
      currency: string;
      metadata: Record<string, string>;
    };
  };
}

export interface PaymentIntentFailedEvent extends WebhookEvent {
  type: 'payment_intent.payment_failed';
  data: {
    object: {
      id: string;
      status: string;
      last_payment_error: {
        code: string;
        message: string;
      };
    };
  };
}

export interface ChargeRefundedEvent extends WebhookEvent {
  type: 'charge.refunded';
  data: {
    object: {
      id: string;
      payment_intent: string;
      amount_refunded: number;
      refunded: boolean;
    };
  };
}
