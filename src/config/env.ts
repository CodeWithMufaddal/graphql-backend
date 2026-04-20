import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  GRAPHQL_PATH: z.string().min(1).default('/graphql'),
  DATABASE_HOST: z.string().min(1).default('localhost'),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_NAME: z.string().min(1).default('graphql-db'),
  DATABASE_USER: z.string().min(1).default('postgres'),
  DATABASE_PASSWORD: z.string().min(1).default('postgres'),
  DATABASE_LOGGING: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().min(2).default('1d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:5173'),
  ALLOW_LOCALHOST_ORIGINS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  METRICS_PATH: z.string().min(1).default('/metrics'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const flat = z.flattenError(parsedEnv.error);
  throw new Error(
    `Invalid environment configuration: ${JSON.stringify(
      {
        formErrors: flat.formErrors,
        fieldErrors: flat.fieldErrors,
      },
      null,
      2,
    )}`,
  );
}

export const env = parsedEnv.data;

