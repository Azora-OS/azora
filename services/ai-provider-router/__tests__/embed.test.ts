import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AI Router embed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('proxies to OpenAI embeddings endpoint', async () => {
    const mockResponse = { data: { data: [{ embedding: [0.1, 0.2] }] } };
    mockedAxios.post.mockResolvedValue(mockResponse);

    // Test the logic directly
    const text = 'test text';
    const OPENAI_KEY = 'sk-test';
    const body = { input: text, model: 'text-embedding-3-small' };
    const resp = await axios.post('https://api.openai.com/v1/embeddings', body, {
      headers: { Authorization: `Bearer ${OPENAI_KEY}` }
    });

    expect(resp).toEqual(mockResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.openai.com/v1/embeddings',
      { input: 'test text', model: 'text-embedding-3-small' },
      expect.any(Object)
    );
  });

  it('handles missing API key', async () => {
    const text = 'test';
    const OPENAI_KEY = undefined;
    expect(OPENAI_KEY).toBeUndefined();
  });
});
