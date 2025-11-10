/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LAYER 2: DATA FOUNDATION - REPOSITORY PATTERN
Base repository implementation for data access layer
*/

import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma-client';

/**
 * Base Repository Interface
 */
export interface IRepository<T, TCreate, TUpdate> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: any): Promise<T[]>;
  create(data: TCreate): Promise<T>;
  update(id: string, data: TUpdate): Promise<T>;
  delete(id: string): Promise<boolean>;
  count(filter?: any): Promise<number>;
}

/**
 * Base Repository Implementation
 */
export abstract class BaseRepository<T, TCreate, TUpdate> implements IRepository<T, TCreate, TUpdate> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(modelName: string, client: PrismaClient = prisma) {
    this.prisma = client;
    this.modelName = modelName;
  }

  abstract findById(id: string): Promise<T | null>;
  abstract findAll(filter?: any): Promise<T[]>;
  abstract create(data: TCreate): Promise<T>;
  abstract update(id: string, data: TUpdate): Promise<T>;
  abstract delete(id: string): Promise<boolean>;
  abstract count(filter?: any): Promise<number>;

  /**
   * Execute with transaction
   */
  protected async withTransaction<R>(
    callback: (tx: PrismaClient) => Promise<R>
  ): Promise<R> {
    return this.prisma.$transaction(callback, {
      maxWait: 5000,
      timeout: 10000,
    });
  }

  /**
   * Handle repository errors
   */
  protected handleError(error: any, operation: string): never {
    console.error(`Repository error [${this.modelName}.${operation}]:`, error);
    throw new Error(`Failed to ${operation} ${this.modelName}: ${error.message}`);
  }
}

/**
 * User Repository Example
 */
export class UserRepository extends BaseRepository<any, any, any> {
  async findById(id: string): Promise<any | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        include: { profile: true },
      });
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findAll(filter?: any): Promise<any[]> {
    try {
      return await this.prisma.user.findMany({
        where: filter,
        include: { profile: true },
      });
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async create(data: any): Promise<any> {
    try {
      return await this.prisma.user.create({
        data,
        include: { profile: true },
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: any): Promise<any> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        include: { profile: true },
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count(filter?: any): Promise<number> {
    try {
      return await this.prisma.user.count({
        where: filter,
      });
    } catch (error) {
      this.handleError(error, 'count');
    }
  }
}

export default BaseRepository;
