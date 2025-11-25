import { AuthContract } from '../contracts/authContract';
import { User } from '../contracts/userContract';

class AuthService {
    private authContract: AuthContract;

    constructor(authContract: AuthContract) {
        this.authContract = authContract;
    }

    async register(user: User): Promise<void> {
        // Logic for user registration
        await this.authContract.registerUser(user);
    }

    async login(username: string, password: string): Promise<string> {
        // Logic for user login
        const token = await this.authContract.authenticateUser(username, password);
        return token;
    }

    async logout(token: string): Promise<void> {
        // Logic for user logout
        await this.authContract.invalidateToken(token);
    }

    async resetPassword(username: string, newPassword: string): Promise<void> {
        // Logic for resetting user password
        await this.authContract.updatePassword(username, newPassword);
    }
}

export default AuthService;

