import { z } from 'zod';

// Base Event Schema
export const BaseEventSchema = z.object({
    id: z.string().uuid(),
    type: z.string(),
    timestamp: z.string().datetime(),
    source: z.string(),
    version: z.string().default('1.0.0'),
});

// User Events
export const UserCreatedEventSchema = BaseEventSchema.extend({
    type: z.literal('USER_CREATED'),
    payload: z.object({
        userId: z.string(),
        email: z.string().email(),
        role: z.enum(['student', 'instructor', 'admin']),
    }),
});

// Course Events
export const CourseEnrolledEventSchema = BaseEventSchema.extend({
    type: z.literal('COURSE_ENROLLED'),
    payload: z.object({
        userId: z.string(),
        courseId: z.string(),
        enrolledAt: z.string().datetime(),
    }),
});

// Payment Events
export const PaymentProcessedEventSchema = BaseEventSchema.extend({
    type: z.literal('PAYMENT_PROCESSED'),
    payload: z.object({
        transactionId: z.string(),
        amount: z.number().positive(),
        currency: z.string(),
        status: z.enum(['success', 'failed']),
    }),
});

// Blockchain Events
export const TokenMintedEventSchema = BaseEventSchema.extend({
    type: z.literal('TOKEN_MINTED'),
    payload: z.object({
        recipient: z.string(),
        amount: z.string(), // BigInt as string
        txHash: z.string(),
    }),
});

// Union of all event schemas
export const EventSchema = z.discriminatedUnion('type', [
    UserCreatedEventSchema,
    CourseEnrolledEventSchema,
    PaymentProcessedEventSchema,
    TokenMintedEventSchema,
]);

export type AzoraEvent = z.infer<typeof EventSchema>;
