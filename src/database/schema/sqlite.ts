import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export function defineSQLiteSchema() {
  const bots = sqliteTable('bots', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').unique().notNull(),
    description: text('description').default(''),
    enabled: integer('enable', { mode: 'boolean' }).default(true).notNull(),
    createdAt: text('created_at')
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updateAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
      () => new Date(),
    ),
  });

  const botInstances = sqliteTable('bot_instances', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    botId: integer('bot_id').references(() => bots.id),
    botUserId: text('bot_user_id'),
    createdAt: text('created_at')
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updateAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
      () => new Date(),
    ),
  });

  const botRuns = sqliteTable('bot_runs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').unique().notNull(),
    status: text('status', {
      enum: [
        'init',
        'waiting',
        'scaning',
        'login',
        'logout',
        'stopped',
        'failed',
      ],
    }).default('waiting'),
    message: text('message').notNull(),
    metadata: text('metadata', { mode: 'json' }),
    createdAt: text('created_at')
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updateAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
      () => new Date(),
    ),
    // Foreign keys
    botId: integer('bot_id')
      .references(() => bots.id)
      .notNull(),
    instanceId: integer('instance_id').references(() => botInstances.id),
  });

  return {
    bots,
    botInstances,
    botRuns,
  };
}

export type SQLiteSchema = ReturnType<typeof defineSQLiteSchema>;
