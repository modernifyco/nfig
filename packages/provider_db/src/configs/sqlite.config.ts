import { join as joinPath } from 'node:path';

import { ConnectionOptions } from 'typeorm';

import {
  sharedDataSourceOptions,
  MIGRATIONS_DIR,
  ACCEPTED_EXTENSIONS,
} from './typeorm_shared.config';

export const SQLITE_MIGRATIONS_DIR = joinPath(MIGRATIONS_DIR, 'sqlite');

export const createSqliteConnectionParams = () => {
  return {
    ...sharedDataSourceOptions,

    /* General */
    type: 'better-sqlite3',

    /* Connection options */
    database: joinPath(process.cwd(), 'template.sqlite'),

    /* List of entities/migrations */
    migrations: [
      joinPath(SQLITE_MIGRATIONS_DIR, '**', `*${ACCEPTED_EXTENSIONS}`),
    ],
  } as ConnectionOptions;
};
