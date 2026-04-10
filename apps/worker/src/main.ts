import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { WorkerModule } from './worker.module.js';
import { loadEnvironment } from '../../api/src/common/config/environment.js';
import { NotificationQueueProcessor } from './processors/notification-queue.processor.js';
import { BillingEventProcessor } from './processors/billing-event.processor.js';
import { ProgressSnapshotProcessor } from './processors/progress-snapshot.processor.js';
import { LessonReminderProcessor } from './processors/lesson-reminder.processor.js';
import { ParentAlertProcessor } from './processors/parent-alert.processor.js';
import { TutorReminderProcessor } from './processors/tutor-reminder.processor.js';

const POLL_INTERVAL_MS = 5000;

async function bootstrap(): Promise<void> {
  const env = loadEnvironment();

  const app = await NestFactory.createApplicationContext(WorkerModule.register(env), {
    logger: ['log', 'warn', 'error'],
  });

  const notificationProcessor = app.get(NotificationQueueProcessor);
  const billingProcessor = app.get(BillingEventProcessor);
  const progressProcessor = app.get(ProgressSnapshotProcessor);
  const lessonReminderProcessor = app.get(LessonReminderProcessor);
  const parentAlertProcessor = app.get(ParentAlertProcessor);
  const tutorReminderProcessor = app.get(TutorReminderProcessor);

  Logger.log('Worker started — polling queues every 5s', 'WorkerBootstrap');

  // Poll loop
  const poll = async () => {
    try {
      await notificationProcessor.process();
      await billingProcessor.process();
      await progressProcessor.process();
      await lessonReminderProcessor.process();
      await parentAlertProcessor.process();
      await tutorReminderProcessor.process();
    } catch (err) {
      Logger.error('Worker poll error', err, 'WorkerBootstrap');
    }
  };

  // Start immediately, then on interval
  void poll();
  setInterval(() => void poll(), POLL_INTERVAL_MS);
}

void bootstrap();
