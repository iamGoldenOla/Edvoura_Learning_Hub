import 'reflect-metadata';

import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import { loadEnvironment } from './common/config/environment.js';
import { ProblemDetailsFilter } from './common/errors/problem-details.filter.js';

async function bootstrap(): Promise<void> {
  const env = loadEnvironment();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.register(env),
    new FastifyAdapter(),
    { rawBody: true },
  );

  await app.register(cors, {
    origin: env.allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
  });

  await app.register(helmet);

  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new ProblemDetailsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EDVOURA Learning Hub API')
    .setDescription('Canonical privileged backend for EDVOURA Learning Hub.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('v1/docs', app, document);

  await app.listen({
    host: env.APP_HOST,
    port: env.APP_PORT,
  });

  Logger.log(
    `${env.APP_NAME} listening on ${env.APP_HOST}:${env.APP_PORT}`,
    'Bootstrap',
  );
}

void bootstrap();
