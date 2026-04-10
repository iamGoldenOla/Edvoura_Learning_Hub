import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BillingService, type PaystackEvent } from './billing.service.js';

@ApiTags('billing')
@Controller('billing')
export class PaystackWebhookController {
  private readonly logger = new Logger(PaystackWebhookController.name);

  constructor(private readonly billingService: BillingService) {}

  @Post('webhooks/paystack')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Paystack webhook receiver' })
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: FastifyRequest & { rawBody?: Buffer },
  ): Promise<{ received: boolean }> {
    const rawBody = (req as FastifyRequest & { rawBody?: Buffer }).rawBody;

    if (!rawBody) {
      throw new BadRequestException('Raw body not available.');
    }

    const isValid = this.billingService.verifyWebhookSignature(rawBody, signature ?? '');

    if (!isValid) {
      this.logger.warn('Paystack webhook signature verification failed');
      throw new BadRequestException('Invalid webhook signature.');
    }

    let event: PaystackEvent;
    try {
      event = JSON.parse(rawBody.toString()) as PaystackEvent;
    } catch {
      throw new BadRequestException('Invalid JSON payload.');
    }

    // Process asynchronously — return 200 immediately per Paystack docs
    void this.billingService.handleEvent(event).catch((err: unknown) => {
      this.logger.error('Error handling Paystack event', err);
    });

    return { received: true };
  }
}
