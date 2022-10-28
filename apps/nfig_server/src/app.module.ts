import { Module } from '@nestjs/common';

import { DatabaseModule } from './modules/database';
import { ConfigModule } from './modules/config';
import { HealthModule } from './modules/health';

@Module({
  imports: [DatabaseModule, ConfigModule, HealthModule],
})
export class AppModule {}
