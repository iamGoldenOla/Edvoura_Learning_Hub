import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module.js';
import { EnvironmentModule } from '../../common/config/environment.module.js';
import { BillingService } from './billing.service.js';
import { BillingController } from './billing.controller.js';
import { PaystackWebhookController } from './paystack-webhook.controller.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [DatabaseModule, EnvironmentModule, UsersModule],
  controllers: [BillingController, PaystackWebhookController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
