import { createClient } from '@libsql/client';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { pathToFileURL } from 'url';

import type { DatabaseInit } from '../init/init';
import { defineSQLiteSchema, type SQLiteSchema } from '../schema/sqlite';

export type SQLiteConnection = LibSQLDatabase<SQLiteSchema>;

function createLibSQLClient(init: DatabaseInit) {
  const client = createClient({
    url: init.url ?? createDatabaseURL(init.base ?? process.cwd()),
    authToken: process.env.DATABASE_AUTH,
  });

  return client;
}

export function createSQLite(
  init: DatabaseInit,
): [SQLiteConnection, SQLiteSchema] {
  const schema = defineSQLiteSchema();
  const client = createLibSQLClient(init);

  const db = drizzle(client, { schema: schema });

  return [db, schema] as const;
}

function createDatabaseURL(baseDir: string) {
  const base = pathToFileURL(baseDir);
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return new URL(databaseUrl, base).toString();
  }

  return new URL('database.db', base).toString();
}
