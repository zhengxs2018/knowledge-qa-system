import type {
  SQLiteInsertBuilder,
  SQLiteUpdateBuilder,
} from 'drizzle-orm/sqlite-core';

import type { DatabaseConnection, ResultSet } from '../drivers/dirivers';
import { type SQLiteSchema } from './sqlite';

// TODO support more drivers
export type Schema = SQLiteSchema;

export type Table<Name extends keyof Schema> = {
  readonly __table: Name;
} & Schema[Name]['$inferInsert'];

export namespace Table {
  export type BotSelect = Schema['bots']['$inferSelect'];
  export type BotInsert = Schema['bots']['$inferInsert'];

  export type BotRunSelect = Schema['botRuns']['$inferSelect'];
  export type BotRunInsert = Schema['botRuns']['$inferInsert'];
  export type BotRunStatus = BotRunInsert['status'];
}

export namespace SQLBuilder {
  export type Query<Name extends keyof Schema> =
    DatabaseConnection['query'][Name];

  export type Insert<Name extends keyof Schema> = SQLiteInsertBuilder<
    Schema[Name],
    'async',
    ResultSet
  >;

  export type Update<Name extends keyof Schema> = SQLiteUpdateBuilder<
    Schema[Name],
    'async',
    ResultSet
  >;
}
