import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PlatformService } from './platform.service.js';

@ApiTags('platform')
@Controller()
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get('health')
  getHealth() {
    return this.platformService.getHealth();
  }

  @Get('ready')
  getReady() {
    return this.platformService.getReady();
  }
}
