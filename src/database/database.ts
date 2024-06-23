import { type interfaces } from 'inversify';

import type { ResultSet } from './drivers/dirivers';
import type { IEntity } from './entities/entities';
import type { Schema, SQLBuilder } from './schema/schema';

export const IDatabaseService: interfaces.ServiceIdentifier<IDatabaseService> =
  Symbol('DatabaseService');

export interface IDatabaseService {
  fields<Name extends keyof Schema>(name: Name): Schema[Name];

  query<Name extends keyof Schema>(name: Name): SQLBuilder.Query<Name>;

  insert<Name extends keyof Schema>(name: Name): SQLBuilder.Insert<Name>;

  update<Name extends keyof Schema>(name: Name): SQLBuilder.Update<Name>;

  del<Name extends keyof Schema>(name: Name): SQLBuilder.Delete<Name>;

  save<Name extends keyof Schema>(entity: IEntity<Name>): Promise<ResultSet>;
}
