import { Module, type DynamicModule } from '@nestjs/common';
import type { Environment } from './common/config/environment.js';
import { EnvironmentModule } from './common/config/environment.module.js';
import { DatabaseModule } from './common/database/database.module.js';
import { SupabaseModule } from './common/supabase/supabase.module.js';
import { NotificationQueueProcessor } from './processors/notification-queue.processor.js';
import { BillingEventProcessor } from './processors/billing-event.processor.js';
import { ProgressSnapshotProcessor } from './processors/progress-snapshot.processor.js';
import { LessonReminderProcessor } from './processors/lesson-reminder.processor.js';
import { ParentAlertProcessor } from './processors/parent-alert.processor.js';
import { TutorReminderProcessor } from './processors/tutor-reminder.processor.js';

@Module({})
export class WorkerModule {
  static register(environment: Environment): DynamicModule {
    return {
      module: WorkerModule,
      imports: [
        EnvironmentModule.forRoot(environment),
        DatabaseModule,
        SupabaseModule,
      ],
      providers: [
        NotificationQueueProcessor, 
        BillingEventProcessor, 
        ProgressSnapshotProcessor,
        LessonReminderProcessor,
        ParentAlertProcessor,
        TutorReminderProcessor
      ],
    };
  }
}
