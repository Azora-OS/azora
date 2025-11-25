import { userContract } from '../../contracts/userContract';
import { authContract } from '../../contracts/authContract';
import { storageContract } from '../../contracts/storageContract';
import { paymentContract } from '../../contracts/paymentContract';

describe('Contracts Tests', () => {
    test('User Contract should be deployed successfully', async () => {
        const result = await userContract.deploy();
        expect(result).toBeTruthy();
    });

    test('Auth Contract should be deployed successfully', async () => {
        const result = await authContract.deploy();
        expect(result).toBeTruthy();
    });

    test('Storage Contract should be deployed successfully', async () => {
        const result = await storageContract.deploy();
        expect(result).toBeTruthy();
    });

    test('Payment Contract should be deployed successfully', async () => {
        const result = await paymentContract.deploy();
        expect(result).toBeTruthy();
    });
});

