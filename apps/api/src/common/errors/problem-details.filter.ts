import {
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { ApplicationError } from './application-error.js';

type ErrorBody = {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
  path: string;
  timestamp: string;
  details?: Record<string, unknown>;
};

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const reply = ctx.getResponse<FastifyReply>();

    const error = this.normalizeException(exception, request.url);

    reply.status(error.status).send(error);
  }

  private normalizeException(exception: unknown, path: string): ErrorBody {
    if (exception instanceof ApplicationError) {
      return this.toErrorBody(
        exception.statusCode,
        exception.code,
        exception.message,
        path,
        exception.details,
      );
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'object' && response !== null) {
        const description =
          'message' in response && typeof response.message === 'string'
            ? response.message
            : exception.message;

        return this.toErrorBody(status, 'http_exception', description, path);
      }

      return this.toErrorBody(status, 'http_exception', exception.message, path);
    }

    console.error('[ProblemDetailsFilter] Unhandled exception:', exception);
    return this.toErrorBody(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'internal_server_error',
      'An unexpected error occurred.',
      path,
    );
  }

  private toErrorBody(
    status: number,
    code: string,
    detail: string,
    path: string,
    details?: Record<string, unknown>,
  ): ErrorBody {
    return {
      type: `https://api.edvoura.local/errors/${code}`,
      title: detail,
      status,
      detail,
      code,
      path,
      timestamp: new Date().toISOString(),
      ...(details ? { details } : {}),
    };
  }
}
