import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

import { ENVIRONMENT } from '../config/environment.constants.js';
import type { Environment } from '../config/environment.js';
import type { Database } from './database.types.js';

const { Pool } = pg;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly db: Kysely<Database>;
  private readonly pool: any;

  constructor(@Inject(ENVIRONMENT) private readonly env: Environment) {
    this.pool = new Pool({
      connectionString: env.SUPABASE_DB_URL,
      ssl: env.NODE_ENV === 'development' ? false : { rejectUnauthorized: false },
      max: env.NODE_ENV === 'development' ? 5 : 20,
    });

    this.db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: this.pool,
      }),
    });
  }

  async ping(): Promise<void> {
    await this.pool.query('select 1');
  }

  async onModuleDestroy(): Promise<void> {
    await this.db.destroy();
    await this.pool.end();
  }
}
