import { AuthService } from '../../services/authService';

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
    });

    test('should create an instance of AuthService', () => {
        expect(authService).toBeInstanceOf(AuthService);
    });

    test('should login a user with valid credentials', async () => {
        const credentials = { username: 'testuser', password: 'password123' };
        const result = await authService.login(credentials);
        expect(result).toHaveProperty('token');
        expect(result).toHaveProperty('user');
    });

    test('should throw an error for invalid credentials', async () => {
        const credentials = { username: 'testuser', password: 'wrongpassword' };
        await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
    });

    test('should register a new user', async () => {
        const userData = { username: 'newuser', password: 'newpassword123' };
        const result = await authService.register(userData);
        expect(result).toHaveProperty('userId');
    });

    test('should throw an error when registering an existing user', async () => {
        const userData = { username: 'testuser', password: 'password123' };
        await expect(authService.register(userData)).rejects.toThrow('User already exists');
    });
});

