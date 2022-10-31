import { join as joinPath } from 'node:path';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { sqliteConnectionOptions } from 'nfig-provider-db';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: joinPath(process.cwd(), 'data', 'db.sqlite'),

      autoLoadEntities: true,
      entities: [joinPath(__dirname, 'entities', '*.entity.js')],
      migrations: [joinPath(__dirname, 'migrations', '*.js')],

      entityPrefix: 'nfigd_',

      metadataTableName: 'nfigd_metadata',
      migrationsTableName: 'nfigd_migrations',

      migrationsTransactionMode: 'each',
      migrationsRun: true,
    }),
  ],
})
export class DatabaseModule {}

// nestjs > 7.1.5
