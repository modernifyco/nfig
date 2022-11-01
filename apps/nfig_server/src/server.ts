import express, { Express } from 'express';
import morgan from 'morgan';
import { Provider } from 'nfig-common';
import cors from 'cors';
import helmet from 'helmet';

import * as configsV1 from './api/configs_v1';
import * as health from './api/health';

export type AppFactoryOptions = {
  provider: Provider;
};

export const create = ({ provider }: AppFactoryOptions): Express => {
  const app = express();

  app.use(cors());
  app.use(helmet.hidePoweredBy());
  app.use(morgan('combined'));

  app.disable('etag');

  app.use('/health', health.create());
  app.use('/api/v1/configs', configsV1.create({ provider }));

  return app;
};
