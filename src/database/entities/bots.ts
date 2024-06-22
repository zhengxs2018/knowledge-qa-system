import {
  Exclude,
  Expose,
  instanceToPlain,
  plainToClass,
} from 'class-transformer';
import { IsInt, IsString, validateOrReject } from 'class-validator';

import type { Table } from '../schema/schema';
import { type IEntity } from './entites';

export class BotsEntity implements IEntity<'bots'> {
  @Exclude()
  readonly __table = 'bots';

  @IsInt()
  @Expose()
  id?: number;

  @IsString()
  @Expose()
  name!: string;

  @IsString()
  @Expose()
  state!: string;

  validate() {
    return validateOrReject(this);
  }

  toJSON() {
    return instanceToPlain(this, {
      strategy: 'exposeAll',
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });
  }

  static create(input: Partial<Table.BotInsert>) {
    return plainToClass(BotsEntity, input);
  }
}
