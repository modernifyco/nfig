import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import {
  HealthCheckService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';

import { MAX_HEAP_SIZE } from '../../../configs/consts';

@Controller({ path: '/health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    protected readonly health: HealthCheckService,

    protected readonly diskHealthIndicator: DiskHealthIndicator,
    protected readonly memoryHealthIndicator: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<any> {
    return this.health.check([
      () => this.memoryHealthIndicator.checkHeap('memory_heap', MAX_HEAP_SIZE),
    ]);
  }
}
