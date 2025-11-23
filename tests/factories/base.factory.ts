import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { getTestPrismaClient } from '../utils/database';

/**
 * Base factory class for creating test data
 */
export abstract class BaseFactory<T> {
  protected prisma: PrismaClient;
  protected createdRecords: Array<{ model: string; id: string }> = [];

  constructor() {
    this.prisma = getTestPrismaClient();
  }

  /**
   * Create a single entity with optional overrides
   */
  abstract create(overrides?: Partial<T>): Promise<T>;

  /**
   * Create multiple entities
   */
  async createMany(count: number, overrides?: Partial<T>): Promise<T[]> {
    const promises = Array.from({ length: count }, () => this.create(overrides));
    return Promise.all(promises);
  }

  /**
   * Track created record for cleanup
   */
  protected trackRecord(model: string, id: string): void {
    this.createdRecords.push({ model, id });
  }

  /**
   * Clean up all created records
   */
  async cleanup(): Promise<void> {
    // Delete in reverse order of creation
    for (const record of this.createdRecords.reverse()) {
      try {
        const model = (this.prisma as any)[record.model];
        if (model) {
          await model.delete({ where: { id: record.id } });
        }
      } catch (error) {
        // Record might already be deleted, ignore
      }
    }
    this.createdRecords = [];
  }

  /**
   * Generate a unique email
   */
  protected generateEmail(prefix?: string): string {
    const uniqueId = faker.string.alphanumeric(8);
    const emailPrefix = prefix || faker.internet.userName();
    return `${emailPrefix}-${uniqueId}@test.azora.com`;
  }

  /**
   * Generate a unique username
   */
  protected generateUsername(prefix?: string): string {
    const uniqueId = faker.string.alphanumeric(6);
    const usernamePrefix = prefix || faker.internet.userName();
    return `${usernamePrefix}_${uniqueId}`;
  }

  /**
   * Generate a random date within range
   */
  protected generateDate(start?: Date, end?: Date): Date {
    return faker.date.between({
      from: start || new Date(2020, 0, 1),
      to: end || new Date(),
    });
  }

  /**
   * Generate random text
   */
  protected generateText(sentences: number = 3): string {
    return faker.lorem.sentences(sentences);
  }

  /**
   * Generate random number within range
   */
  protected generateNumber(min: number = 0, max: number = 100): number {
    return faker.number.int({ min, max });
  }

  /**
   * Pick random item from array
   */
  protected pickRandom<T>(items: T[]): T {
    return faker.helpers.arrayElement(items);
  }

  /**
   * Generate random boolean
   */
  protected generateBoolean(): boolean {
    return faker.datatype.boolean();
  }
}

/**
 * Factory registry for managing multiple factories
 */
export class FactoryRegistry {
  private factories: Map<string, BaseFactory<any>> = new Map();

  /**
   * Register a factory
   */
  register<T>(name: string, factory: BaseFactory<T>): void {
    this.factories.set(name, factory);
  }

  /**
   * Get a factory by name
   */
  get<T>(name: string): BaseFactory<T> | undefined {
    return this.factories.get(name);
  }

  /**
   * Clean up all registered factories
   */
  async cleanupAll(): Promise<void> {
    const cleanupPromises = Array.from(this.factories.values()).map(factory =>
      factory.cleanup()
    );
    await Promise.all(cleanupPromises);
  }
}

// Global factory registry
export const factoryRegistry = new FactoryRegistry();
