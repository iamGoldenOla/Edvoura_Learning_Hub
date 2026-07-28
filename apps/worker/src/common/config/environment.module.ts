import { Global, Module, type DynamicModule } from '@nestjs/common';

import { ENVIRONMENT } from './environment.constants.js';
import type { Environment } from './environment.js';

@Global()
@Module({})
export class EnvironmentModule {
  static forRoot(environment: Environment): DynamicModule {
    return {
      module: EnvironmentModule,
      providers: [
        {
          provide: ENVIRONMENT,
          useValue: environment,
        },
      ],
      exports: [ENVIRONMENT],
    };
  }
}
