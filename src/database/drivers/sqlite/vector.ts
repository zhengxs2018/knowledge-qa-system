import type { ColumnBaseConfig } from 'drizzle-orm/column';
import type {
  ColumnBuilderBaseConfig,
  ColumnBuilderRuntimeConfig,
  MakeColumnConfig,
} from 'drizzle-orm/column-builder';
import { entityKind } from 'drizzle-orm/entity';
import {
  SQLiteColumn,
  SQLiteColumnBuilder,
  SQLiteTable,
} from 'drizzle-orm/sqlite-core';

export interface SQLiteVectorConfig {
  dimensions?: number;
}

export type SQLiteVectorBuilderInitial<TName extends string> =
  SQLiteVectorBuilder<{
    name: TName;
    dataType: 'string';
    columnType: 'SQLiteVector';
    data: number[];
    driverParam: string;
    enumValues: undefined;
  }>;

export class SQLiteVectorBuilder<
  T extends ColumnBuilderBaseConfig<'string', 'SQLiteVector'>,
> extends SQLiteColumnBuilder<T, { dimensions: number | undefined }> {
  static readonly [entityKind]: string = 'SQLiteVectorBuilder';

  constructor(name: T['name'], config?: SQLiteVectorConfig) {
    super(name, 'string', 'SQLiteVector');
    this.config.dimensions = config?.dimensions;
  }

  /** @internal */
  build<TTableName extends string>(
    table: SQLiteTable,
  ): SQLiteVector<MakeColumnConfig<T, TTableName>> {
    return new SQLiteVector<MakeColumnConfig<T, TTableName>>(
      table,
      this.config as ColumnBuilderRuntimeConfig<any, any>,
    );
  }
}

export class SQLiteVector<
  T extends ColumnBaseConfig<'string', 'SQLiteVector'>,
> extends SQLiteColumn<T, { dimensions?: number }> {
  static readonly [entityKind]: string = 'SQLiteVector';

  readonly dimensions = this.config.dimensions;

  getSQLType(): string {
    return `vector(${this.dimensions})`;
  }

  override mapToDriverValue(value: unknown): unknown {
    return JSON.stringify(value);
  }

  override mapFromDriverValue(value: string): unknown {
    return value
      .slice(1, -1)
      .split(',')
      .map(v => Number.parseFloat(v));
  }
}

export function vector<TName extends string>(
  name: TName,
  config?: SQLiteVectorConfig,
): SQLiteVectorBuilderInitial<TName> {
  return new SQLiteVectorBuilder(name, config);
}
