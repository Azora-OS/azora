import { PaymentContract } from '../contracts/paymentContract';
import { User } from '../contracts/userContract';
import { Transaction } from '../contracts/storageContract';

class PaymentService {
    private paymentContract: PaymentContract;

    constructor() {
        this.paymentContract = new PaymentContract();
    }

    async processPayment(user: User, amount: number): Promise<Transaction> {
        // Validate user and amount
        if (!user || amount <= 0) {
            throw new Error('Invalid user or amount');
        }

        // Process the payment through the payment contract
        const transaction = await this.paymentContract.executePayment(user.id, amount);
        return transaction;
    }

    async refundPayment(transactionId: string): Promise<boolean> {
        // Validate transaction ID
        if (!transactionId) {
            throw new Error('Invalid transaction ID');
        }

        // Process the refund through the payment contract
        const result = await this.paymentContract.executeRefund(transactionId);
        return result;
    }
}

export default PaymentService;

