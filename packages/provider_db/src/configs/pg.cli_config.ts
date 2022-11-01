import { ConnectionOptions } from 'typeorm';

import { PG_MIGRATIONS_DIR, createPgConnectionParams } from './pg.config';
import { ENTITIES_DIR } from './typeorm_shared.config';

export const ormconfig = {
  ...createPgConnectionParams(),

  /* CLI */
  cli: { entitiesDir: ENTITIES_DIR, migrationsDir: PG_MIGRATIONS_DIR },
} as Partial<ConnectionOptions>;

export default ormconfig;
