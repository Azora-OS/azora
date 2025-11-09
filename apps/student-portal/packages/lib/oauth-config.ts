/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

// OAuth Configuration for Google and GitHub
export interface OAuthConfig {
  google: {
    clientId: string;
    redirectUri: string;
    scopes: string[];
  };
  github: {
    clientId: string;
    redirectUri: string;
    scopes: string[];
  };
}

export const OAUTH_CONFIG: OAuthConfig = {
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '528292508791-t5afqpudv40lj4cnl414tbqkf40j84tb.apps.googleusercontent.com',
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback/google`,
    scopes: ['openid', 'email', 'profile'],
  },
  github: {
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Ov23lili0YUqQFzzqFFH',
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback/github`,
    scopes: ['user:email', 'read:user'],
  },
};

/**
 * Generate OAuth authorization URL for the specified provider
 */
export function generateOAuthUrl(provider: 'google' | 'github'): string {
  const config = OAUTH_CONFIG[provider];

  if (!config.clientId) {
    throw new Error(`${provider} OAuth is not configured. Please set the client ID.`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    response_type: 'code',
    state: generateState(),
  });

  const baseUrl = provider === 'google'
    ? 'https://accounts.google.com/o/oauth2/v2/auth'
    : 'https://github.com/login/oauth/authorize';

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate a random state parameter for OAuth security
 */
function generateState(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Validate OAuth state parameter
 */
export function validateState(state: string): boolean {
  // In a real implementation, you'd store the state in session storage
  // and validate it here. For now, we'll just check if it's a valid format.
  return /^[a-z0-9]+\.[a-z0-9]+$/.test(state);
}