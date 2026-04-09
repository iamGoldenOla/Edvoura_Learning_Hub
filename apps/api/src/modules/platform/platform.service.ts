import { Inject, Injectable } from '@nestjs/common';

import { ENVIRONMENT } from '../../common/config/environment.constants.js';
import type { Environment } from '../../common/config/environment.js';
import { DatabaseService } from '../../common/database/database.service.js';
import { SupabaseService } from '../../common/supabase/supabase.service.js';

@Injectable()
export class PlatformService {
  constructor(
    @Inject(ENVIRONMENT) private readonly env: Environment,
    private readonly databaseService: DatabaseService,
    private readonly supabaseService: SupabaseService,
  ) {}

  getHealth() {
    return {
      status: 'ok',
      service: this.env.APP_NAME,
      timestamp: new Date().toISOString(),
    };
  }

  async getReady() {
    await this.databaseService.ping();

    return {
      status: 'ready',
      service: this.env.APP_NAME,
      database: 'ok',
      supabaseUrl: this.supabaseService.projectUrl,
      timestamp: new Date().toISOString(),
    };
  }
}
