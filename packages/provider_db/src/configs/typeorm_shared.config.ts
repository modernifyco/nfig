import { resolve as resolvePath, join as joinPath } from 'node:path';

import { ConnectionOptions } from 'typeorm';

export const MODULE_NAME = 'nfig';

export const ENTITY_PREFIX = `${MODULE_NAME}_`;

export const MIGRATIONS_TABLE_NAME = `${MODULE_NAME}_typeorm_migrations`;
export const METADATA_TABLE_NAME = `${MODULE_NAME}_typeorm_metadata`;

export const ACCEPTED_EXTENSIONS = '{.ts,.js}';

/* FIXED RELATIVE PATHS */
const ROOT_DIR = resolvePath(joinPath(__dirname, '..'));
export const ENTITIES_DIR = joinPath(ROOT_DIR, 'models');
export const MIGRATIONS_DIR = joinPath(ROOT_DIR, 'migrations');

export const sharedDataSourceOptions: Partial<ConnectionOptions> = {
  /* Connection options */
  entityPrefix: ENTITY_PREFIX,

  /* List of entities/migrations */
  entities: [joinPath(ENTITIES_DIR, '**', `*.entity${ACCEPTED_EXTENSIONS}`)],

  /* Disable auto migration */
  migrationsRun: true,
  synchronize: false,
  migrationsTableName: MIGRATIONS_TABLE_NAME,
  migrationsTransactionMode: 'each',
  metadataTableName: METADATA_TABLE_NAME,

  /* Caching */
  cache: false,

  /* logging */
  logging: ['error', 'warn'], // logs everything except query
  logger: 'advanced-console',
};
