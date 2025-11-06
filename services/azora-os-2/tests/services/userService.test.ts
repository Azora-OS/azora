import { UserService } from '../../services/userService';
import { User } from '../../contracts/userContract';

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        userService = new UserService();
    });

    it('should create a new user', async () => {
        const userData: User = {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            password: 'securepassword',
        };

        const createdUser = await userService.createUser(userData);
        expect(createdUser).toEqual(expect.objectContaining(userData));
    });

    it('should retrieve a user by ID', async () => {
        const userId = '1';
        const user = await userService.getUserById(userId);
        expect(user).toBeDefined();
        expect(user.id).toBe(userId);
    });

    it('should update a user', async () => {
        const userId = '1';
        const updatedData = { name: 'Jane Doe' };
        const updatedUser = await userService.updateUser(userId, updatedData);
        expect(updatedUser.name).toBe(updatedData.name);
    });

    it('should delete a user', async () => {
        const userId = '1';
        const result = await userService.deleteUser(userId);
        expect(result).toBe(true);
    });
});

