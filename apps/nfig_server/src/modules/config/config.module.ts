import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database';
import { ConfigControllerV1 } from './controllers/config_v1.controller';
import { ConfigService } from './services/config.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ConfigControllerV1],
  providers: [ConfigService],
})
export class ConfigModule {}
