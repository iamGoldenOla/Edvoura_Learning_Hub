import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { WorkerModule } from './worker.module.js';
import { loadEnvironment } from '../../api/src/common/config/environment.js';
import { NotificationQueueProcessor } from './processors/notification-queue.processor.js';
import { BillingEventProcessor } from './processors/billing-event.processor.js';

const POLL_INTERVAL_MS = 5000;

async function bootstrap(): Promise<void> {
  const env = loadEnvironment();

  const app = await NestFactory.createApplicationContext(WorkerModule.register(env), {
    logger: ['log', 'warn', 'error'],
  });

  const notificationProcessor = app.get(NotificationQueueProcessor);
  const billingProcessor = app.get(BillingEventProcessor);

  Logger.log('Worker started — polling queues every 5s', 'WorkerBootstrap');

  // Poll loop
  const poll = async () => {
    try {
      await notificationProcessor.process();
      await billingProcessor.process();
    } catch (err) {
      Logger.error('Worker poll error', err, 'WorkerBootstrap');
    }
  };

  // Start immediately, then on interval
  void poll();
  setInterval(() => void poll(), POLL_INTERVAL_MS);
}

void bootstrap();
