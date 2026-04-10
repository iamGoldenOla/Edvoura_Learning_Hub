import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module.js';
import { SupabaseModule } from '../../common/supabase/supabase.module.js';
import { UsersModule } from '../users/users.module.js';
import { ParentsController } from './parents.controller.js';
import { ParentsService } from './parents.service.js';

@Module({
  imports: [DatabaseModule, SupabaseModule, UsersModule],
  controllers: [ParentsController],
  providers: [ParentsService],
  exports: [ParentsService],
})
export class ParentsModule {}
