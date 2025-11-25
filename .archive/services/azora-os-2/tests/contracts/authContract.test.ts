import { expect } from 'chai';
import { AuthContract } from '../../contracts/authContract';

describe('AuthContract', () => {
    let authContract: AuthContract;

    beforeEach(() => {
        authContract = new AuthContract();
    });

    it('should initialize with default values', () => {
        expect(authContract.isAuthenticated).to.be.false;
        expect(authContract.user).to.be.null;
    });

    it('should authenticate a user', () => {
        const user = { username: 'testUser', password: 'testPass' };
        authContract.authenticate(user);
        expect(authContract.isAuthenticated).to.be.true;
        expect(authContract.user).to.deep.equal(user);
    });

    it('should fail to authenticate with wrong credentials', () => {
        const user = { username: 'testUser', password: 'wrongPass' };
        authContract.authenticate(user);
        expect(authContract.isAuthenticated).to.be.false;
        expect(authContract.user).to.be.null;
    });

    it('should log out a user', () => {
        const user = { username: 'testUser', password: 'testPass' };
        authContract.authenticate(user);
        authContract.logout();
        expect(authContract.isAuthenticated).to.be.false;
        expect(authContract.user).to.be.null;
    });
});

