import { User } from '../contracts/userContract';
import { AuthService } from './authService';
import { DatabaseService } from './databaseService';

export class UserService {
    private authService: AuthService;
    private databaseService: DatabaseService;

    constructor() {
        this.authService = new AuthService();
        this.databaseService = new DatabaseService();
    }

    public async createUser(userData: User): Promise<User> {
        // Validate user data
        const isValid = this.validateUserData(userData);
        if (!isValid) {
            throw new Error('Invalid user data');
        }

        // Create user in the database
        const newUser = await this.databaseService.createUser(userData);
        return newUser;
    }

    public async getUser(userId: string): Promise<User | null> {
        return await this.databaseService.getUserById(userId);
    }

    public async updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
        return await this.databaseService.updateUser(userId, userData);
    }

    public async deleteUser(userId: string): Promise<boolean> {
        return await this.databaseService.deleteUser(userId);
    }

    private validateUserData(userData: User): boolean {
        // Implement validation logic
        return true; // Placeholder for actual validation
    }
}

