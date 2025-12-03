import { SimpleExecutor } from '../src/executor';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SimpleExecutor', () => {
  it('calls AI provider when llm payload present', async () => {
    const resp = { data: { choices: [{ message: { content: 'hello' } }] } };
    mockedAxios.post.mockResolvedValue(resp as any);
    const exec = new SimpleExecutor();
    const result = await exec.executeTask({ id: 't1', createdAt: '', payload: { llm: { model: 'gpt-4', messages: [{ role: 'user', content: 'hi' }] } }, status: 'pending' } as any);
    expect(result.success).toBe(true);
    expect(mockedAxios.post).toHaveBeenCalled();
  });
});
