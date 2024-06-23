import type { ResultSet } from '@libsql/client';
import { inject, injectable } from 'inversify';

import { IEnvironmentService } from '../base/common/environment/environment';
import type { IDatabaseService } from './database';
import { type DatabaseConnection } from './drivers/dirivers';
import { type IEntity } from './entities/entities';
import { initDatabase } from './init/init';
import { type Schema } from './schema/schema';

@injectable()
export class DatabaseService implements IDatabaseService {
  readonly connection: DatabaseConnection;
  readonly schema: Schema;

  constructor(
    @inject(IEnvironmentService)
    private readonly environmentService: IEnvironmentService,
  ) {
    const { appRoot } = this.environmentService;

    const [connection, schema] = initDatabase({
      base: appRoot,
    });

    this.schema = schema;
    this.connection = connection;
  }

  fields<Name extends keyof Schema>(name: Name): Schema[Name] {
    return this.schema[name];
  }

  query<Name extends keyof Schema>(name: Name) {
    const { connection } = this;
    return connection.query[name];
  }

  insert<Name extends keyof Schema>(name: Name) {
    const { connection, schema } = this;
    return connection.insert(schema[name]);
  }

  update<Name extends keyof Schema>(name: Name) {
    const { connection, schema } = this;
    return connection.update(schema[name]);
  }

  del<Name extends keyof Schema>(name: Name) {
    const { connection, schema } = this;
    return connection.delete(schema[name]);
  }

  save<Name extends keyof Schema>(entity: IEntity<Name>): Promise<ResultSet> {
    return this.insert(entity.__table).values(entity.toJSON());
  }
}
