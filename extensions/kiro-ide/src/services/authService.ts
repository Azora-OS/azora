import * as vscode from 'vscode';

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export class AuthService {
  private context: vscode.ExtensionContext;
  private token: AuthToken | undefined;
  private user: User | undefined;
  private apiUrl: string;

  constructor(context: vscode.ExtensionContext, apiUrl: string = 'https://api.azora.io') {
    this.context = context;
    this.apiUrl = apiUrl;
    this.loadStoredToken();
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      this.setToken(data);
      this.user = data.user;

      return this.user;
    } catch (error) {
      throw new Error(`Login failed: ${error}`);
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    this.token = undefined;
    this.user = undefined;
    await this.context.secrets.delete('kiro.authToken');
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<void> {
    if (!this.token) {
      throw new Error('No token to refresh');
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.token.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setToken(data);
    } catch (error) {
      throw new Error(`Token refresh failed: ${error}`);
    }
  }

  /**
   * Get current token
   */
  getToken(): AuthToken | undefined {
    if (this.token && this.isTokenExpired()) {
      return undefined;
    }
    return this.token;
  }

  /**
   * Get current user
   */
  getUser(): User | undefined {
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token && !this.isTokenExpired();
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(): boolean {
    if (!this.token) {
      return true;
    }
    return Date.now() >= this.token.expiresAt;
  }

  /**
   * Set token and store securely
   */
  private async setToken(data: any): Promise<void> {
    const expiresAt = Date.now() + data.expiresIn * 1000;

    this.token = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      expiresAt,
    };

    // Store in VS Code keychain
    await this.context.secrets.store('kiro.authToken', JSON.stringify(this.token));
  }

  /**
   * Load stored token from keychain
   */
  private async loadStoredToken(): Promise<void> {
    try {
      const stored = await this.context.secrets.get('kiro.authToken');
      if (stored) {
        this.token = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load stored token:', error);
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission: string): boolean {
    if (!this.user) {
      return false;
    }

    // Admin has all permissions
    if (this.user.roles.includes('admin')) {
      return true;
    }

    // Check role-based permissions
    const rolePermissions: { [key: string]: string[] } = {
      editor: ['read', 'write', 'comment'],
      viewer: ['read'],
      admin: ['read', 'write', 'delete', 'admin'],
    };

    for (const role of this.user.roles) {
      if (rolePermissions[role]?.includes(permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get authorization header
   */
  getAuthHeader(): { Authorization: string } | undefined {
    const token = this.getToken();
    if (!token) {
      return undefined;
    }

    return {
      Authorization: `Bearer ${token.accessToken}`,
    };
  }
}
