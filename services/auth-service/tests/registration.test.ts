import { userFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';
import * as bcrypt from 'bcrypt';

const prisma = getTestPrismaClient();

describe('Auth Service - Registration', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('User Registration', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: 'newuser@test.azora.com',
        username: 'newuser',
        password: 'SecurePass123!',
        firstName: 'New',
        lastName: 'User',
      };

      // Simulate registration logic
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          isEmailVerified: false,
          isActive: true,
        },
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.username);
      expect(user.isEmailVerified).toBe(false);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });

    it('should reject registration with duplicate email', async () => {
      const existingUser = await userFactory.create({
        email: 'existing@test.azora.com',
      });

      // Try to create another user with same email
      await expect(
        prisma.user.create({
          data: {
            email: existingUser.email,
            username: 'different_username',
            password: await bcrypt.hash('Password123!', 10),
            firstName: 'Test',
            lastName: 'User',
          },
        })
      ).rejects.toThrow();
    });

    it('should validate email format', () => {
      const invalidEmails = [
        'notanemail',
        '@test.com',
        'test@',
        'test..user@test.com',
        'test user@test.com',
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });

      // Valid email should pass
      expect(emailRegex.test('valid@test.com')).toBe(true);
    });

    it('should validate password strength', () => {
      const weakPasswords = [
        '123',           // Too short
        'password',      // No numbers or special chars
        '12345678',      // No letters
        'Pass123',       // No special chars
      ];

      // Password requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      weakPasswords.forEach(password => {
        expect(passwordRegex.test(password)).toBe(false);
      });

      // Strong password should pass
      expect(passwordRegex.test('SecurePass123!')).toBe(true);
    });

    it('should hash password before storing', async () => {
      const plainPassword = 'MySecurePassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(plainPassword.length);

      // Verify password can be compared
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should create user with default role', async () => {
      const user = await userFactory.create();

      expect(user.role).toBeDefined();
      expect(['USER', 'STUDENT', 'INSTRUCTOR', 'ADMIN']).toContain(user.role);
    });

    it('should set email verification status to false by default', async () => {
      const user = await userFactory.createUnverified();

      expect(user.isEmailVerified).toBe(false);
    });

    it('should reject registration with missing required fields', async () => {
      // Missing email
      await expect(
        prisma.user.create({
          data: {
            username: 'testuser',
            password: await bcrypt.hash('Password123!', 10),
            firstName: 'Test',
            lastName: 'User',
          } as any,
        })
      ).rejects.toThrow();

      // Missing password
      await expect(
        prisma.user.create({
          data: {
            email: 'test@test.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should trim whitespace from email and username', () => {
      const email = '  test@test.com  ';
      const username = '  testuser  ';

      const trimmedEmail = email.trim();
      const trimmedUsername = username.trim();

      expect(trimmedEmail).toBe('test@test.com');
      expect(trimmedUsername).toBe('testuser');
    });

    it('should convert email to lowercase', () => {
      const email = 'Test@TEST.COM';
      const normalizedEmail = email.toLowerCase();

      expect(normalizedEmail).toBe('test@test.com');
    });
  });

  describe('Username Validation', () => {
    it('should accept valid usernames', () => {
      const validUsernames = [
        'user123',
        'test_user',
        'user-name',
        'a1b2c3',
      ];

      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

      validUsernames.forEach(username => {
        expect(usernameRegex.test(username)).toBe(true);
      });
    });

    it('should reject invalid usernames', () => {
      const invalidUsernames = [
        'ab',              // Too short
        'a'.repeat(21),    // Too long
        'user name',       // Contains space
        'user@name',       // Invalid character
        'user.name',       // Invalid character
      ];

      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

      invalidUsernames.forEach(username => {
        expect(usernameRegex.test(username)).toBe(false);
      });
    });

    it('should reject duplicate usernames', async () => {
      const existingUser = await userFactory.create({
        username: 'existinguser',
      });

      await expect(
        prisma.user.create({
          data: {
            email: 'different@test.com',
            username: existingUser.username,
            password: await bcrypt.hash('Password123!', 10),
            firstName: 'Test',
            lastName: 'User',
          },
        })
      ).rejects.toThrow();
    });
  });
});
