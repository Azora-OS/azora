import { expect } from 'chai';
import { UserContract } from '../../contracts/userContract';

describe('UserContract', () => {
    let userContract: UserContract;

    beforeEach(() => {
        userContract = new UserContract();
    });

    it('should create a user successfully', async () => {
        const user = { name: 'John Doe', email: 'john@example.com' };
        const result = await userContract.createUser(user);
        expect(result).to.have.property('id');
        expect(result.name).to.equal(user.name);
        expect(result.email).to.equal(user.email);
    });

    it('should fail to create a user with duplicate email', async () => {
        const user = { name: 'Jane Doe', email: 'jane@example.com' };
        await userContract.createUser(user);
        try {
            await userContract.createUser(user);
        } catch (error) {
            expect(error.message).to.equal('Email already exists');
        }
    });

    it('should retrieve a user by ID', async () => {
        const user = { name: 'Alice', email: 'alice@example.com' };
        const createdUser = await userContract.createUser(user);
        const retrievedUser = await userContract.getUserById(createdUser.id);
        expect(retrievedUser).to.deep.equal(createdUser);
    });

    it('should return null for a non-existent user', async () => {
        const retrievedUser = await userContract.getUserById('non-existent-id');
        expect(retrievedUser).to.be.null;
    });

    it('should update a user successfully', async () => {
        const user = { name: 'Bob', email: 'bob@example.com' };
        const createdUser = await userContract.createUser(user);
        const updatedUser = { name: 'Robert', email: 'robert@example.com' };
        const result = await userContract.updateUser(createdUser.id, updatedUser);
        expect(result.name).to.equal(updatedUser.name);
        expect(result.email).to.equal(updatedUser.email);
    });

    it('should delete a user successfully', async () => {
        const user = { name: 'Charlie', email: 'charlie@example.com' };
        const createdUser = await userContract.createUser(user);
        await userContract.deleteUser(createdUser.id);
        const retrievedUser = await userContract.getUserById(createdUser.id);
        expect(retrievedUser).to.be.null;
    });
});

