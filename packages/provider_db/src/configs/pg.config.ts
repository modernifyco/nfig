import { join as joinPath } from 'node:path';

import { get as env } from 'env-var';
import { ConnectionOptions } from 'typeorm';

import {
  MODULE_NAME,
  sharedDataSourceOptions,
  MIGRATIONS_DIR,
  ACCEPTED_EXTENSIONS,
} from './typeorm_shared.config';

export const PG_MIGRATIONS_DIR = joinPath(MIGRATIONS_DIR, 'pg');

export const createPgConnectionParams = () => {
  const DB_URL = env('NFIG_PG_DB_URL').required().asUrlString();
  const DB_SCHEMA = env('NFIG_PG_DB_SCHEMA').default('public').asString();

  return {
    ...sharedDataSourceOptions,

    /* General */
    type: 'postgres',
    installExtensions: true,
    applicationName: `${MODULE_NAME}_database_cli`,

    /* Connection options */
    url: DB_URL,
    schema: DB_SCHEMA,
    connectTimeoutMS: 15 * 1000,

    /* List of entities/migrations */
    migrations: [joinPath(PG_MIGRATIONS_DIR, '**', `*${ACCEPTED_EXTENSIONS}`)],
  } as Partial<ConnectionOptions>;
};
