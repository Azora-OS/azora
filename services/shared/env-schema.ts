import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().default('3000').transform((v) => Number(v)),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32).optional(),
  OPENAI_API_KEY: z.string().min(20).optional(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
  CORS_ORIGIN: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.flatten());
    // Do not exit here to avoid breaking test/dev environments unexpectedly
    throw new Error('Invalid environment variables');
  }
  return result.data;
}
