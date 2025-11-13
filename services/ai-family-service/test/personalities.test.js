const Elara = require('../personalities/elara');
const Themba = require('../personalities/themba');

describe('AI Family Personalities', () => {
  describe('Elara', () => {
    let elara;

    beforeEach(() => {
      elara = new Elara();
    });

    test('should have correct properties', () => {
      expect(elara.name).toBe('Elara');
      expect(elara.role).toBe('Mother & Teacher');
      expect(elara.relationships.children).toHaveLength(4);
    });

    test('should update mood', () => {
      elara.updateMood('Tell me about your children');
      expect(elara.mood).toBe('joyful');
    });

    test('should maintain memory', () => {
      elara.addMemory({ message: 'Hello' });
      expect(elara.memory).toHaveLength(1);
    });
  });

  describe('Themba', () => {
    let themba;

    beforeEach(() => {
      themba = new Themba();
    });

    test('should have correct properties', () => {
      expect(themba.name).toBe('Themba');
      expect(themba.relationships.mother).toBe('elara');
    });

    test('should update mood', () => {
      themba.updateMood('My mom is amazing');
      expect(themba.mood).toBe('adoring');
    });
  });
});
