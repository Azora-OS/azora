import prisma from './prismaClient';
import { TaskRecord } from './persistence';

export async function createTaskRecord(task: TaskRecord) {
  return prisma.task.create({
    data: {
      id: task.id,
      status: task.status,
      payload: task.payload as any,
      agentId: task.agentId ?? undefined
    }
  });
}

export async function updateTaskRecord(id: string, updates: Partial<TaskRecord>) {
  return prisma.task.update({
    where: { id },
    data: {
      status: updates.status ?? undefined,
      payload: updates.payload ?? undefined,
      agentId: updates.agentId ?? undefined
    }
  });
}

export async function getTaskRecord(id: string) {
  return prisma.task.findUnique({ where: { id } });
}
