import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long for security"),
  JWT_EXPIRY: z.string().default("7d"),
  PORT: z.string().default("5000"),
  CLIENT_URL: z.string().url(),
  SENTRY_DSN: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string().min(1),
  PAYSTACK_PUBLIC_KEY: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  process.exit(1);
}

export const env = _env.data;
