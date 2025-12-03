import { logger } from './logger';

interface Provider {
  name: string;
  priority: number;
  available: boolean;
  lastFailure?: number;
}

export class ProviderFallback {
  private providers: Provider[] = [
    { name: 'openai', priority: 1, available: true },
    { name: 'anthropic', priority: 2, available: true },
    { name: 'bedrock', priority: 3, available: true }
  ];

  async executeWithFallback<T>(operation: (provider: string) => Promise<T>): Promise<T> {
    const sorted = this.providers
      .filter(p => p.available)
      .sort((a, b) => a.priority - b.priority);

    for (const provider of sorted) {
      try {
        const result = await operation(provider.name);
        this.markSuccess(provider.name);
        return result;
      } catch (err: any) {
        logger.warn({ provider: provider.name, err }, 'Provider failed, trying fallback');
        this.markFailure(provider.name);
      }
    }

    throw new Error('All providers failed');
  }

  private markSuccess(name: string): void {
    const provider = this.providers.find(p => p.name === name);
    if (provider) {
      provider.available = true;
      provider.lastFailure = undefined;
    }
  }

  private markFailure(name: string): void {
    const provider = this.providers.find(p => p.name === name);
    if (provider) {
      provider.lastFailure = Date.now();
      setTimeout(() => { provider.available = true; }, 60000);
    }
  }
}
