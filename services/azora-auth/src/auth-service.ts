import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Environment variables with defaults for development
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'CHANGE_THIS_REFRESH_IN_PRODUCTION';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

// Warn if using default secrets
if (JWT_SECRET === 'CHANGE_THIS_IN_PRODUCTION') {
    console.warn('⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET environment variable in production!');
}

export interface RegisterInput {
    email: string;
    password: string;
    name: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResult {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
    accessToken: string;
    refreshToken: string;
}

/**
 * Register a new user with bcrypt password hashing
 */
export async function register(input: RegisterInput): Promise<AuthResult> {
    const { email, password, name } = input;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            password: passwordHash,
            name,
            role: 'STUDENT' // Default role
        }
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    await prisma.token.create({
        data: {
            userId: user.id,
            type: 'REFRESH',
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        accessToken,
        refreshToken
    };
}

/**
 * Login with email and password
 */
export async function login(input: LoginInput): Promise<AuthResult> {
    const { email, password } = input;

    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    await prisma.token.create({
        data: {
            userId: user.id,
            type: 'REFRESH',
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        accessToken,
        refreshToken
    };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
        // Verify refresh token
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };

        // Check if refresh token exists in database
        const tokenRecord = await prisma.token.findFirst({
            where: {
                token: refreshToken,
                type: 'REFRESH',
                expiresAt: {
                    gt: new Date()
                }
            },
            include: {
                user: true
            }
        });

        if (!tokenRecord) {
            throw new Error('Invalid or expired refresh token');
        }

        // Generate new access token
        const accessToken = generateAccessToken(
            tokenRecord.user.id,
            tokenRecord.user.email,
            tokenRecord.user.role
        );

        return { accessToken };
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): { userId: string; email: string; role: string } {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            email: string;
            role: string;
        };
        return payload;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

/**
 * Logout - invalidate refresh token
 */
export async function logout(refreshToken: string): Promise<void> {
    await prisma.token.deleteMany({
        where: {
            token: refreshToken,
            type: 'REFRESH'
        }
    });
}

// Helper functions

function generateAccessToken(userId: string, email: string, role: string): string {
    return jwt.sign(
        { userId, email, role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
}

function generateRefreshToken(userId: string): string {
    return jwt.sign(
        { userId },
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRY }
    );
}
