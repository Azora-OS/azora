import { faker } from '@faker-js/faker';
import { User, UserRole } from '@prisma/client';
import { BaseFactory } from './base.factory';
import * as bcrypt from 'bcrypt';

export interface CreateUserOptions {
  email?: string;
  username?: string;
  password?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
}

/**
 * Factory for creating test users
 */
export class UserFactory extends BaseFactory<User> {
  /**
   * Create a test user
   */
  async create(overrides?: CreateUserOptions): Promise<User> {
    const email = overrides?.email || this.generateEmail();
    const username = overrides?.username || this.generateUsername();
    const password = overrides?.password || 'Test123!@#';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: overrides?.role || UserRole.USER,
        firstName: overrides?.firstName || faker.person.firstName(),
        lastName: overrides?.lastName || faker.person.lastName(),
        isEmailVerified: overrides?.isEmailVerified ?? true,
        isActive: overrides?.isActive ?? true,
      },
    });

    this.trackRecord('user', user.id);
    return user;
  }

  /**
   * Create a test student user
   */
  async createStudent(overrides?: CreateUserOptions): Promise<User> {
    return this.create({
      ...overrides,
      role: UserRole.STUDENT,
    });
  }

  /**
   * Create a test instructor user
   */
  async createInstructor(overrides?: CreateUserOptions): Promise<User> {
    const user = await this.create({
      ...overrides,
      role: UserRole.INSTRUCTOR,
    });

    // Create instructor profile if needed
    // This would depend on your schema
    
    return user;
  }

  /**
   * Create a test admin user
   */
  async createAdmin(overrides?: CreateUserOptions): Promise<User> {
    return this.create({
      ...overrides,
      role: UserRole.ADMIN,
    });
  }

  /**
   * Create user with specific email domain
   */
  async createWithDomain(domain: string, overrides?: CreateUserOptions): Promise<User> {
    const username = faker.internet.userName();
    const email = `${username}@${domain}`;
    
    return this.create({
      ...overrides,
      email,
    });
  }

  /**
   * Create unverified user
   */
  async createUnverified(overrides?: CreateUserOptions): Promise<User> {
    return this.create({
      ...overrides,
      isEmailVerified: false,
    });
  }

  /**
   * Create inactive user
   */
  async createInactive(overrides?: CreateUserOptions): Promise<User> {
    return this.create({
      ...overrides,
      isActive: false,
    });
  }
}

// Export singleton instance
export const userFactory = new UserFactory();
