import { Module } from '@nestjs/common';

import { UserContextService } from './user-context.service.js';

@Module({
  providers: [UserContextService],
  exports: [UserContextService],
})
export class UsersModule {}
