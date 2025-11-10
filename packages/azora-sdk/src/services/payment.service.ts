import { AxiosInstance } from 'axios';
import { ApiResponse, PaymentResponse, WalletBalance, Transaction } from '../types';

export class PaymentService {
  constructor(private axios: AxiosInstance) {}

  async createPayment(
    amount: number, 
    currency: string, 
    userId: string,
    description?: string
  ): Promise<PaymentResponse> {
    try {
      const response = await this.axios.post('/payments/create', { 
        amount, 
        currency, 
        userId,
        description 
      });
      return { 
        success: true, 
        transactionId: response.data.transactionId,
        amount,
        currency,
        status: response.data.status
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async getBalance(userId: string): Promise<ApiResponse<WalletBalance>> {
    try {
      const response = await this.axios.get(`/payments/balance/${userId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async listTransactions(userId: string, filters?: {
    limit?: number;
    type?: 'credit' | 'debit';
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Transaction[]>> {
    try {
      const response = await this.axios.get(`/payments/transactions/${userId}`, {
        params: filters
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async refund(transactionId: string, reason?: string): Promise<PaymentResponse> {
    try {
      const response = await this.axios.post(`/payments/refund`, { 
        transactionId,
        reason 
      });
      return { 
        success: true, 
        transactionId: response.data.transactionId,
        status: 'completed'
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async earnTokens(userId: string, amount: number, reason: string): Promise<PaymentResponse> {
    try {
      const response = await this.axios.post('/payments/earn', {
        userId,
        amount,
        reason
      });
      return {
        success: true,
        transactionId: response.data.transactionId,
        amount,
        currency: 'AZR',
        status: 'completed'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async transfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    currency: string
  ): Promise<PaymentResponse> {
    try {
      const response = await this.axios.post('/payments/transfer', {
        fromUserId,
        toUserId,
        amount,
        currency
      });
      return {
        success: true,
        transactionId: response.data.transactionId,
        status: 'completed'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}
