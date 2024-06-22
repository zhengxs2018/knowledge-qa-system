import { defineSQLiteSchema } from '../schema/sqlite';

// TODO support more drivers
const schema = defineSQLiteSchema();

// @ts-expect-error ignore error
export = schema;
