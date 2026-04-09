import {
  Injectable,
  type PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new UnprocessableEntityException({
        message: 'Validation failed.',
        issues: result.error.flatten(),
      });
    }

    return result.data;
  }
}
