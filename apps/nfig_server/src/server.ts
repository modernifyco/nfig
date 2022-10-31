import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { VersioningType, RequestMethod } from '@nestjs/common';
import * as helmet from 'helmet';

import { API_VERSIONS } from './configs/consts';
import { AppModule } from './app.module';

(async () => {
  const app = await NestFactory.create(AppModule, {
    autoFlushLogs: true,
    cors: true,
  });

  app.use(helmet.hidePoweredBy());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSIONS.default,
  });

  app.setGlobalPrefix('/api', {
    exclude: [
      {
        path: '/health',
        method: RequestMethod.ALL,
      },
    ],
  });

  await app.listen(3000);
})().catch(console.error);
