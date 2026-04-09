import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().min(1).default('edvoura-api'),
  APP_PORT: z.coerce.number().int().positive().default(4000),
  APP_HOST: z.string().min(1).default('0.0.0.0'),
  APP_BASE_URL: z.string().url().default('http://localhost:4000'),
  WEB_APP_URL: z.string().url().default('http://localhost:3000'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_DB_URL: z.string().min(1),
  SUPABASE_JWKS_URL: z.string().url().optional(),
  JWT_AUDIENCE: z.string().default('authenticated'),
  JWT_ISSUER: z.string().url().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Environment = z.infer<typeof environmentSchema> & {
  allowedOrigins: string[];
  supabaseJwksUrl: string;
  jwtIssuer: string;
};

export const loadEnvironment = (
  input: Record<string, string | undefined> = process.env,
): Environment => {
  const parsed = environmentSchema.parse(input);

  return {
    ...parsed,
    allowedOrigins: parsed.ALLOWED_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    supabaseJwksUrl:
      parsed.SUPABASE_JWKS_URL ??
      `${parsed.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
    jwtIssuer: parsed.JWT_ISSUER ?? `${parsed.SUPABASE_URL}/auth/v1`,
  };
};
