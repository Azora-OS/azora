import { expect } from 'chai';
import { PaymentContract } from '../../contracts/paymentContract';

describe('PaymentContract', () => {
    let paymentContract: PaymentContract;

    beforeEach(() => {
        paymentContract = new PaymentContract();
    });

    it('should initialize with correct values', () => {
        expect(paymentContract).to.exist;
        expect(paymentContract.balance).to.equal(0);
    });

    it('should allow payments to be made', () => {
        paymentContract.makePayment(100);
        expect(paymentContract.balance).to.equal(100);
    });

    it('should not allow payments greater than balance', () => {
        paymentContract.makePayment(100);
        expect(() => paymentContract.makePayment(200)).to.throw('Insufficient balance');
    });

    it('should allow refunds', () => {
        paymentContract.makePayment(100);
        paymentContract.refund(50);
        expect(paymentContract.balance).to.equal(50);
    });

    it('should not allow refunds greater than balance', () => {
        paymentContract.makePayment(100);
        expect(() => paymentContract.refund(150)).to.throw('Refund exceeds balance');
    });
});

