const { encrypt, decrypt, hashPassword } = require('../src/middleware/encryption');

describe('Encryption', () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = Buffer.from('a'.repeat(64), 'utf8').toString('hex').slice(0, 64);
  });

  test('should encrypt and decrypt text', () => {
    const text = 'sensitive data';
    const { encrypted, iv, authTag } = encrypt(text);
    const decrypted = decrypt(encrypted, iv, authTag);
    
    expect(decrypted).toBe(text);
  });

  test('should produce different ciphertext for same input', () => {
    const text = 'test';
    const result1 = encrypt(text);
    const result2 = encrypt(text);
    
    expect(result1.encrypted).not.toBe(result2.encrypted);
  });

  test('should hash passwords consistently', () => {
    const password = 'password123';
    const hash1 = hashPassword(password);
    const hash2 = hashPassword(password);
    
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(password);
  });
});
