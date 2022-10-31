import { ConnectionOptions } from 'typeorm';

import { postgresConnectionOptions, PG_MIGRATIONS_DIR } from './pg.config';
import { ENTITIES_DIR } from './typeorm_shared.config';

export const ormconfig = {
  ...postgresConnectionOptions,

  /* CLI */
  cli: { entitiesDir: ENTITIES_DIR, migrationsDir: PG_MIGRATIONS_DIR },
} as Partial<ConnectionOptions>;

export default ormconfig;
