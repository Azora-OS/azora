import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function recordBlockchainEvent(data: {
  type: string;
  source: string;
  payload: any;
}) {
  return await prisma.event.create({
    data: {
      type: data.type,
      source: data.source,
      data: data.payload,
    }
  });
}

export default { recordBlockchainEvent };
