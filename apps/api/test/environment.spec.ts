import { describe, expect, it } from 'vitest';

import { loadEnvironment } from '../src/common/config/environment.js';

describe('loadEnvironment', () => {
  it('derives Supabase JWT endpoints from the project URL', () => {
    const environment = loadEnvironment({
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_ANON_KEY: 'anon',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      SUPABASE_DB_URL: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
    });

    expect(environment.supabaseJwksUrl).toBe(
      'https://example.supabase.co/auth/v1/.well-known/jwks.json',
    );
    expect(environment.jwtIssuer).toBe('https://example.supabase.co/auth/v1');
    expect(environment.allowedOrigins).toEqual(['http://localhost:3000']);
  });
});
