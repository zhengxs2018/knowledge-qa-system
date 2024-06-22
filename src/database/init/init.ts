import { createSQLite } from '../drivers/libsql';

export interface DatabaseInit {
  base?: string;
  url?: string
}

// TODO support more drivers
export function initDatabase(init: DatabaseInit) {
  return createSQLite(init);
}
