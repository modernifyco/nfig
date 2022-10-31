import { ConnectionOptions } from 'typeorm';

import {
  sqliteConnectionOptions,
  SQLITE_MIGRATIONS_DIR,
} from './sqlite.config';
import { ENTITIES_DIR } from './typeorm_shared.config';

export const ormconfig = {
  ...sqliteConnectionOptions,

  /* CLI */
  cli: { entitiesDir: ENTITIES_DIR, migrationsDir: SQLITE_MIGRATIONS_DIR },
} as Partial<ConnectionOptions>;

export default ormconfig;
