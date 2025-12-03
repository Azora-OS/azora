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

export async function createExecutionRecord(execution: { id?: string; taskId: string; status: string; logs?: any; result?: any }) {
  return prisma.execution.create({ data: {
    id: execution.id ?? undefined,
    taskId: execution.taskId,
    status: execution.status,
    logs: execution.logs ?? undefined,
    result: execution.result ?? undefined
  }});
}

export async function updateExecutionRecord(id: string, updates: Partial<{ status: string; logs: any; result: any }>) {
  return prisma.execution.update({ where: { id }, data: { status: updates.status ?? undefined, logs: updates.logs ?? undefined, result: updates.result ?? undefined } });
}

export async function getExecutionRecord(id: string) {
  return prisma.execution.findUnique({ where: { id } });
}

export async function getActiveExecutionForTask(taskId: string) {
  return prisma.execution.findFirst({ where: { taskId, status: 'running' } });
}
