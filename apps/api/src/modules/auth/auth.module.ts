import { Module } from '@nestjs/common';

import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard.js';
import { AuthController } from './auth.controller.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [SupabaseJwtGuard],
})
export class AuthModule {}
