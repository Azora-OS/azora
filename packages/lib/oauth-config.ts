/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * OAuth Configuration for Google and GitHub Authentication
 * Supports learning platform integration and workspace access
 */

export interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string[];
  redirectUri: string;
}

export interface OAuthConfig {
  google: OAuthProvider;
  github: OAuthProvider;
  apple: OAuthProvider;
  learning: {
    googleClassroom: OAuthProvider;
    githubClassroom: OAuthProvider;
  };
  workspace: {
    github: OAuthProvider;
    googleDrive: OAuthProvider;
  };
}

export const OAUTH_CONFIG: OAuthConfig = {
  google: {
    name: 'Google',
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: ['openid', 'email', 'profile'],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/google`,
  },
  github: {
    name: 'GitHub',
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scope: ['user:email', 'read:user', 'repo'],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/github`,
  },
  apple: {
    name: 'Apple',
    clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
    clientSecret: process.env.APPLE_CLIENT_SECRET || '',
    authorizationUrl: 'https://appleid.apple.com/auth/authorize',
    tokenUrl: 'https://appleid.apple.com/auth/token',
    userInfoUrl: 'https://appleid.apple.com/auth/userinfo', // Note: Apple doesn't provide a userinfo endpoint
    scope: ['name', 'email'],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/apple`,
  },
  learning: {
    googleClassroom: {
      name: 'Google Classroom',
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLASSROOM_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLASSROOM_CLIENT_SECRET || '',
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://classroom.googleapis.com/v1/courses',
      scope: ['https://www.googleapis.com/auth/classroom.courses.readonly', 'https://www.googleapis.com/auth/classroom.coursework.me'],
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/google-classroom`,
    },
    githubClassroom: {
      name: 'GitHub Classroom',
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLASSROOM_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLASSROOM_CLIENT_SECRET || '',
      authorizationUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user/repos',
      scope: ['user:email', 'read:user', 'repo', 'read:org'],
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/github-classroom`,
    },
  },
  workspace: {
    github: {
      name: 'GitHub Workspace',
      clientId: process.env.NEXT_PUBLIC_GITHUB_WORKSPACE_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_WORKSPACE_CLIENT_SECRET || '',
      authorizationUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user/repos',
      scope: ['user:email', 'read:user', 'repo', 'read:org', 'workflow'],
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/github-workspace`,
    },
    googleDrive: {
      name: 'Google Drive',
      clientId: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET || '',
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/drive/v3/files',
      scope: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly'],
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/google-drive`,
    },
  },
};

/**
 * Generate OAuth authorization URL
 */
export function generateOAuthUrl(provider: keyof OAuthConfig): string {
  const config = OAUTH_CONFIG[provider];
  if (!config) throw new Error(`OAuth provider ${provider} not configured`);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope.join(' '),
    response_type: 'code',
    state: generateState(),
  });

  return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * Generate random state for OAuth security
 */
export function generateState(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Validate OAuth state parameter
 */
export function validateState(state: string): boolean {
  // In production, store state in session and validate
  return state.length > 10; // Basic validation
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  provider: keyof OAuthConfig,
  code: string
): Promise<{ access_token: string; refresh_token?: string; expires_in?: number }> {
  const config = OAUTH_CONFIG[provider];
  if (!config) throw new Error(`OAuth provider ${provider} not configured`);

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get user info from OAuth provider
 */
export async function getUserInfo(
  provider: keyof OAuthConfig,
  accessToken: string
): Promise<any> {
  const config = OAUTH_CONFIG[provider];
  if (!config) throw new Error(`OAuth provider ${provider} not configured`);

  const response = await fetch(config.userInfoUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.statusText}`);
  }

  return response.json();
}