/**
 * NextAuth Configuration for Azora Ecosystem
 * Supports Google, GitHub, and Email/Password authentication
 */

import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import api from './api-client';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password required');
                }

                try {
                    const response = await api.auth.login(credentials.email, credentials.password);
                    const { user, token } = response.data;

                    if (user && token) {
                        // Store token in localStorage (will be handled client-side)
                        return { ...user, accessToken: token };
                    }
                    return null;
                } catch (error: any) {
                    throw new Error(error.response?.data?.message || 'Authentication failed');
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user, account }) {
            // Initial sign in
            if (account && user) {
                return {
                    ...token,
                    accessToken: (user as any).accessToken || account.access_token,
                    refreshToken: account.refresh_token,
                    user,
                };
            }

            // Return previous token if the access token has not expired yet
            return token;
        },

        async session({ session, token }) {
            session.user = token.user as any;
            (session as any).accessToken = token.accessToken;
            return session;
        },
    },

    pages: {
        signIn: '/login',
        signOut: '/logout',
        error: '/auth/error',
    },

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
