import StreamingAssembler from '../streamingUtils';

describe('StreamingAssembler', () => {
  test('dedupes identical chunks', () => {
    const a = new StreamingAssembler({ dedupe: true, trim: true });
    expect(a.accept('Hello').length).toBeGreaterThan(0);
    // Duplicate chunk should be ignored
    expect(a.accept('Hello').length).toBe(0);
  });

  test('reassembles split code blocks', () => {
    const a = new StreamingAssembler({ dedupe: true, trim: true });
    const chunk1 = 'Here is a code block: ```js\nconsole.log(';
    const part2 = "'hello'\n)\n```";
    const res1 = a.accept('Here is a code block: ```js\nconsole.log(');
    const res2 = a.accept("'hello'\n)\n```");
    const combined = [...res1, ...res2];
    const matched = combined.find(c => c.text.includes('```js'));
    expect(matched).toBeDefined();
    expect(matched!.text).toMatch(/console.log\('hello'\)/);
  });

  test('reassembles split JSON fragments', () => {
    const a = new StreamingAssembler({ dedupe: true, trim: true });
    const part1 = '{"name": "Azora", "details": {"lang": "';
    const part2 = 'typescript", "version": 1}}';
    const res1 = a.accept(part1);
    expect(res1.length).toBe(0);
    const res2 = a.accept(part2);
    const combined = [...res1, ...res2];
    const matched = combined.find(c => c.text.trim().startsWith('{') && c.text.includes('Azora'));
    expect(matched).toBeDefined();
    expect(matched!.text).toMatch(/"lang": "typescript"/);
  });
});
