import { pathToFileURL } from 'node:url';

import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/init/schema.ts',
  out: './migrations/database',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: pathToFileURL(
      process.env.DATABASE_URL ?? '.hackai/database.db',
    ).toString(),
  },
});
