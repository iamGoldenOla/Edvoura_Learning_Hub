import { Module, type DynamicModule } from '@nestjs/common';

import { DatabaseModule } from './common/database/database.module.js';
import { EnvironmentModule } from './common/config/environment.module.js';
import type { Environment } from './common/config/environment.js';
import { SupabaseModule } from './common/supabase/supabase.module.js';
import { AcademicsModule } from './modules/academics/academics.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { BillingModule } from './modules/billing/billing.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { ParentsModule } from './modules/parents/parents.module.js';
import { PlatformModule } from './modules/platform/platform.module.js';
import { StudentsModule } from './modules/students/students.module.js';
import { TutorsModule } from './modules/tutors/tutors.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { SubmissionsModule } from './modules/submissions/submissions.module.js';
import { QuizAttemptsModule } from './modules/quiz-attempts/quiz-attempts.module.js';
import { CommunicationsModule } from './modules/communications/communications.module.js';

@Module({})
export class AppModule {
  static register(environment: Environment): DynamicModule {
    return {
      module: AppModule,
      imports: [
        EnvironmentModule.forRoot(environment),
        DatabaseModule,
        SupabaseModule,
        PlatformModule,
        AuthModule,
        UsersModule,
        ParentsModule,
        StudentsModule,
        TutorsModule,
        AcademicsModule,
        NotificationsModule,
        BillingModule,
        AdminModule,
        SubmissionsModule,
        QuizAttemptsModule,
        CommunicationsModule,
      ],
    };
  }
}
