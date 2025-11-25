import { PaymentService } from '../../services/paymentService';
import { mockPaymentData } from '../mocks/paymentData';

describe('PaymentService', () => {
    let paymentService: PaymentService;

    beforeEach(() => {
        paymentService = new PaymentService();
    });

    test('should process payment successfully', async () => {
        const response = await paymentService.processPayment(mockPaymentData.validPayment);
        expect(response).toHaveProperty('status', 'success');
        expect(response).toHaveProperty('transactionId');
    });

    test('should throw error for invalid payment data', async () => {
        await expect(paymentService.processPayment(mockPaymentData.invalidPayment)).rejects.toThrow('Invalid payment data');
    });

    test('should handle payment gateway errors', async () => {
        jest.spyOn(paymentService, 'processPayment').mockImplementationOnce(() => {
            throw new Error('Payment gateway error');
        });

        await expect(paymentService.processPayment(mockPaymentData.validPayment)).rejects.toThrow('Payment gateway error');
    });
});

