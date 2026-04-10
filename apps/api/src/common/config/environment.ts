import { z } from 'zod';

// Treat empty strings the same as missing (undefined)
const optionalString = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string().min(1).optional(),
);
const optionalUrl = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string().url().optional(),
);

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
  SUPABASE_JWKS_URL: optionalUrl,
  JWT_AUDIENCE: z.string().default('authenticated'),
  JWT_ISSUER: optionalUrl,
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  // Paystack billing
  PAYSTACK_SECRET_KEY: optionalString,
  PAYSTACK_WEBHOOK_SECRET: optionalString,
  // Email notifications (Resend)
  RESEND_API_KEY: optionalString,
  RESEND_WEBHOOK_SECRET: optionalString,
  RESEND_FROM_EMAIL: z.string().email().default('notifications@edvoura.com'),
  // Live class providers
  ZOOM_ACCOUNT_ID: optionalString,
  ZOOM_CLIENT_ID: optionalString,
  ZOOM_CLIENT_SECRET: optionalString,
  // Google Meet (service account)
  GOOGLE_SERVICE_ACCOUNT_KEY_JSON: optionalString,
  GOOGLE_CALENDAR_IMPERSONATE_EMAIL: optionalString,
  // Support
  SUPPORT_EMAIL: z.string().email().default('support@edvoura.com'),
  DEFAULT_TIMEZONE: z.string().default('Africa/Lagos'),
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
