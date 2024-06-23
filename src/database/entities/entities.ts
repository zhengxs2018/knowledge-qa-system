import type { Schema, Table } from '../schema/schema';

interface IEntityBase {
  validate(): Promise<void>;
  toJSON(): any;
}

export type IEntity<Name extends keyof Schema> = IEntityBase & Table<Name>;
