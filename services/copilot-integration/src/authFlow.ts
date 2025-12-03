import { logger } from './logger';

interface AuthToken {
  token: string;
  expiresAt: number;
  userId: string;
  scopes: string[];
}

interface ConsentRecord {
  userId: string;
  service: string;
  granted: boolean;
  timestamp: string;
  scopes: string[];
}

export class AuthFlow {
  private tokens = new Map<string, AuthToken>();
  private consents = new Map<string, ConsentRecord>();

  async requestConsent(userId: string, service: string, scopes: string[]): Promise<boolean> {
    const key = `${userId}:${service}`;
    const existing = this.consents.get(key);

    if (existing && existing.granted && this.scopesMatch(existing.scopes, scopes)) {
      return true;
    }

    logger.info({ userId, service, scopes }, 'Consent requested');
    return false;
  }

  grantConsent(userId: string, service: string, scopes: string[]): void {
    const key = `${userId}:${service}`;
    this.consents.set(key, {
      userId,
      service,
      granted: true,
      timestamp: new Date().toISOString(),
      scopes
    });
    logger.info({ userId, service }, 'Consent granted');
  }

  revokeConsent(userId: string, service: string): void {
    const key = `${userId}:${service}`;
    this.consents.delete(key);
    logger.info({ userId, service }, 'Consent revoked');
  }

  async createToken(userId: string, scopes: string[]): Promise<string> {
    const token = this.generateToken();
    const expiresAt = Date.now() + 3600000; // 1 hour

    this.tokens.set(token, {
      token,
      expiresAt,
      userId,
      scopes
    });

    return token;
  }

  async validateToken(token: string): Promise<AuthToken | null> {
    const auth = this.tokens.get(token);
    if (!auth) return null;
    if (auth.expiresAt < Date.now()) {
      this.tokens.delete(token);
      return null;
    }
    return auth;
  }

  private generateToken(): string {
    return `azr_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private scopesMatch(granted: string[], requested: string[]): boolean {
    return requested.every(s => granted.includes(s));
  }

  getConsents(userId: string): ConsentRecord[] {
    return Array.from(this.consents.values()).filter(c => c.userId === userId);
  }
}
