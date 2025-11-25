import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';
import { paymentService } from '../../services/paymentService';

describe('Service Index Tests', () => {
    it('should have userService defined', () => {
        expect(userService).toBeDefined();
    });

    it('should have authService defined', () => {
        expect(authService).toBeDefined();
    });

    it('should have storageService defined', () => {
        expect(storageService).toBeDefined();
    });

    it('should have paymentService defined', () => {
        expect(paymentService).toBeDefined();
    });
});

