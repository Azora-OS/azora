import { DatabaseIndexer } from '../src/indexer';
import axios from 'axios';

jest.mock('@prisma/client', () => {
  const upsert = jest.fn();
  const exec = jest.fn();
  const tr = function() {
    return { knowledgeNode: { upsert }, $executeRawUnsafe: exec, $executeRaw: exec };
  } as any;
  return { PrismaClient: jest.fn(() => tr()) };
});

jest.mock('axios');

describe('DatabaseIndexer (mocked Prisma)', () => {
  it('writes embeddingJson via upsert and attempts to update vector', async () => {
    const ax = axios as jest.Mocked<typeof axios>;
    ax.post.mockResolvedValueOnce({ data: { data: [{ embedding: [0.1, 0.2, 0.3] }] } });
    const indexer = new DatabaseIndexer('http://localhost:4010');
    const upsertSpy = (indexer as any).prisma.knowledgeNode.upsert as jest.Mock;
    const execSpy = (indexer as any).prisma.$executeRawUnsafe as jest.Mock;
    const nodes = [{ id: 'n1', path: 'p', type: 'file', content: 'hi' } as any];
    await indexer.indexNodes(nodes);
    expect(upsertSpy).toHaveBeenCalled();
    const arg = upsertSpy.mock.calls[0][0];
    expect(arg.create.embeddingJson).toBeDefined();
    expect(execSpy).toHaveBeenCalled();
  });
});
