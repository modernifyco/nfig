import { Module } from '@nestjs/common';

import { ConfigModule } from './modules/config';
import { HealthModule } from './modules/health';

@Module({
  imports: [ConfigModule, HealthModule],
})
export class AppModule {}
