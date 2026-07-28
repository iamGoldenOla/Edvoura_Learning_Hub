import { Inject, Injectable } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { ENVIRONMENT } from '../config/environment.constants.js';
import type { Environment } from '../config/environment.js';

@Injectable()
export class SupabaseService {
  readonly adminClient: SupabaseClient;

  constructor(@Inject(ENVIRONMENT) private readonly env: Environment) {
    this.adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  get projectUrl(): string {
    return this.env.SUPABASE_URL;
  }
}
