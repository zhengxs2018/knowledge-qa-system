import type { interfaces } from 'inversify';

import type { Table } from '../database/schema/schema';
import type { IBotsService } from './bots';

export const IBotRunsService: interfaces.ServiceIdentifier<IBotRunsService> =
  Symbol('BotRunsService');

export interface IBotRun {
  /**
   * The identifier.
   */
  id: number;

  /**
   * The bot identifier.
   */
  botId: number;

  /**
   * The puppet identifier.
   */
  instanceId?: number | null;

  /**
   * The bot name, which can be referenced in the API endpoints.
   */
  name: string;

  /**
   * The status of the run.
   */
  status: Table.BotRunStatus;

  /**
   * The message of the run.
   */
  message: string;

  /**
   * The object type, which is always "bot.run".
   */
  object: 'bot.run';

  /**
   * The Unix timestamp when the model was created.
   */
  created: number;
}

export interface IBotRunsService {
  readonly bots: IBotsService;

  create(name: string): Promise<IBotRun>;

  retrieve(name: string): Promise<IBotRun | undefined>;
  retrieve(name: string, rejectOnNotFound: true): Promise<IBotRun>;
  retrieve(
    name: string,
    rejectOnNotFound?: boolean,
  ): Promise<IBotRun | undefined>;

  cancel(name: string): Promise<IBotRun>;

  online(name: string): Promise<boolean>;
}
