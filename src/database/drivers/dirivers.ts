import type { ResultSet as SQLiteResultSet } from '@libsql/client';

import { type SQLiteConnection } from './libsql';

export type DatabaseConnection = SQLiteConnection;

export type ResultSet = SQLiteResultSet;
