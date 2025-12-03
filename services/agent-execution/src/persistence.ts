import { logger } from './logger';
// Minimal in-memory persistence to start with for development;
// production can use Prisma + Postgres.
import prisma from './prismaClient';
import { createTaskRecord, getTaskRecord, updateTaskRecord } from './repo';

export type TaskRecord = {
  id: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  payload: Record<string, any>;
  agentId?: string;
};

export const inMemoryTaskStore = new Map<string, TaskRecord>();

export async function saveTask(task: TaskRecord): Promise<void> {
  logger.debug({ task }, 'saveTask');
  if (process.env.DATABASE_URL) {
    try {
      await createTaskRecord(task);
      return;
    } catch (err) {
      logger.error({ err }, 'prisma.saveTask');
      // fallback to memory
    }
  }

  inMemoryTaskStore.set(task.id, task);
}

export async function getTask(id: string): Promise<TaskRecord | null> {
  if (process.env.DATABASE_URL) {
    try {
      const t = await getTaskRecord(id);
      if (t) {
        return {
          id: t.id,
          status: t.status,
          createdAt: t.createdAt.getTime(),
          updatedAt: t.updatedAt.getTime(),
          payload: t.payload as any,
          agentId: t.agentId ?? undefined
        } as TaskRecord;
      }
    } catch (err) {
      logger.error({ err }, 'prisma.getTask');
    }
  }
  return inMemoryTaskStore.get(id) ?? null;
}

export async function updateTask(id: string, updates: Partial<TaskRecord>): Promise<void> {
  if (process.env.DATABASE_URL) {
    try {
      await updateTaskRecord(id, updates);
      return;
    } catch (err) {
      logger.error({ err }, 'prisma.updateTask');
      // fallback to memory
    }
  }

  const existing = inMemoryTaskStore.get(id);
  if (!existing) throw new Error(`Task ${id} not found`);
  const updated = { ...existing, ...updates, updatedAt: Date.now() };
  inMemoryTaskStore.set(id, updated);
}

