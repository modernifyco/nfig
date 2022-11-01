#!/usr/bin/env node

const { join: joinPath } = require('node:path');
const { mkdirSync, existsSync } = require('node:fs');
const {
  createSqliteConnectionParams,
  DatabaseProvider,
} = require('nfig-provider-db');
const { Connection } = require('typeorm');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const Server = require(joinPath(__dirname, '..', 'dist'));

const cliOptions = yargs(hideBin(process.argv))
  .option('port', {
    type: 'number',
    default: '8080',
    description: 'HTTP port number',
  })
  .help().argv;

(async () => {
  const DATA_DIR = joinPath(process.cwd(), 'data');

  if (existsSync(DATA_DIR) === false) {
    mkdirSync(DATA_DIR);
  }

  const connection = new Connection({
    ...createSqliteConnectionParams(),
    database: joinPath(DATA_DIR, 'db.sqlite'),
  });
  await connection.connect();
  const provider = new DatabaseProvider({ connection });

  const server = Server.create({ provider });

  server.listen({ port: cliOptions.port }, () => {
    console.debug(`[nfigd] Server started :${cliOptions.port}`);
  });
})()
  .then()
  .catch(console.error);
