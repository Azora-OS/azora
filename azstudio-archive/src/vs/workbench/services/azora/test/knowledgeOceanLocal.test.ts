import LocalVectorOcean from '../knowledgeOceanLocal';

describe('LocalVectorOcean', () => {
  test('indexes docs and returns relevant snippet', async () => {
    const lvo = new LocalVectorOcean();
    await lvo.indexDocs([
      { id: 'd1', title: 'Intro to Math', content: 'This course covers algebra, equations, and arithmetic basics.' },
      { id: 'd2', title: 'Physics 101', content: 'Newton laws, forces, and motion explained.' },
    ]);
    const res = await lvo.query('algebra');
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].title).toMatch(/Math|algebra/i);
  });
});
