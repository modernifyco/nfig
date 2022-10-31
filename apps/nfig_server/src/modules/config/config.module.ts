import { Module } from '@nestjs/common';

import { ConfigControllerV1 } from './controllers/config_v1.controller';
import { ConfigService } from './services/config.service';

@Module({
  controllers: [ConfigControllerV1],
  providers: [ConfigService],
})
export class ConfigModule {}
