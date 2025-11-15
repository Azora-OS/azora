export class RedisMock {
  private store: Map<string, string> = new Map();
  private expirations: Map<string, number> = new Map();

  async get(key: string): Promise<string | null> {
    if (this.isExpired(key)) {
      this.store.delete(key);
      this.expirations.delete(key);
      return null;
    }
    return this.store.get(key) || null;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    this.store.set(key, value);
    if (mode === 'EX' && duration) {
      this.expirations.set(key, Date.now() + duration * 1000);
    }
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0;
    keys.forEach(key => {
      if (this.store.delete(key)) deleted++;
      this.expirations.delete(key);
    });
    return deleted;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Array.from(this.store.keys()).filter(key => regex.test(key));
  }

  async flushall(): Promise<'OK'> {
    this.store.clear();
    this.expirations.clear();
    return 'OK';
  }

  private isExpired(key: string): boolean {
    const expiration = this.expirations.get(key);
    return expiration ? Date.now() > expiration : false;
  }
}

export const createRedisMock = (): RedisMock => new RedisMock();
