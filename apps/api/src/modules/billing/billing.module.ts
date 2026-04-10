import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module.js';
import { EnvironmentModule } from '../../common/config/environment.module.js';
import { BillingService } from './billing.service.js';
import { PaystackWebhookController } from './paystack-webhook.controller.js';

@Module({
  imports: [DatabaseModule, EnvironmentModule],
  controllers: [PaystackWebhookController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
