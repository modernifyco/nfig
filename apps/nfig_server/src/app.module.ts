import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import bytes from 'bytes';
import { get as env } from 'env-var';
import { Provider } from 'nfig-common';
import { sqliteConnectionOptions } from 'nfig-provider-db';

import { ConfigModule } from './modules/config';

@Module({
  imports: [
    TerminusModule,
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
  providers: [
    {
      provide: 'CONST_MAX_HEAP_SIZE',
      useValue: bytes.parse(env('MAX_HEAP_SIZE').default('256mb').asString()),
    },
    {
      provide: 'PROVIDER',
      useFactory: async () => {},
    },
  ],
  controllers: [],
})
export class AppModule {}
