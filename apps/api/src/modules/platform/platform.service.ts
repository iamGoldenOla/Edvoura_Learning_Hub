import { Inject, Injectable } from '@nestjs/common';
import type { ListDashboardUiActionsQueryDto, RecordDashboardUiActionDto } from '@edvoura/contracts';

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

  async recordUiAction(userId: string, input: RecordDashboardUiActionDto) {
    const now = new Date().toISOString();

    await this.databaseService.db
      .insertInto('audit.audit_logs')
      .values({
        actor_user_id: userId,
        action: 'ui.action',
        entity_table: input.scope,
        entity_id: null,
        request_id: null,
        ip_address: null,
        user_agent: null,
        metadata: {
          actionKey: input.actionKey,
          label: input.label,
          scope: input.scope,
          nextPath: input.nextPath ?? null,
          ...(input.metadata ?? {}),
        },
        created_at: now,
      })
      .execute();

    return {
      ok: true,
      timestamp: now,
      actionKey: input.actionKey,
      message: `${input.label} recorded.`,
    };
  }

  async listUiActions(userId: string, query: ListDashboardUiActionsQueryDto) {
    let builder = this.databaseService.db
      .selectFrom('audit.audit_logs')
      .select([
        'id',
        'action',
        'entity_table as scope',
        'metadata',
        'created_at as createdAt',
      ])
      .where('actor_user_id', '=', userId)
      .where('action', '=', 'ui.action')
      .orderBy('created_at', 'desc')
      .limit(query.limit);

    if (query.scope) {
      builder = builder.where('entity_table', '=', query.scope);
    }

    const rows = await builder.execute();
    return rows.map((row) => ({
      id: row.id,
      scope: row.scope,
      actionKey:
        typeof (row.metadata as Record<string, unknown>)?.actionKey === 'string'
          ? ((row.metadata as Record<string, unknown>).actionKey as string)
          : 'unknown',
      label:
        typeof (row.metadata as Record<string, unknown>)?.label === 'string'
          ? ((row.metadata as Record<string, unknown>).label as string)
          : 'Action',
      nextPath:
        typeof (row.metadata as Record<string, unknown>)?.nextPath === 'string'
          ? ((row.metadata as Record<string, unknown>).nextPath as string)
          : null,
      createdAt: row.createdAt,
    }));
  }
}
