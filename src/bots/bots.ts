import type { interfaces } from 'inversify';

import type { IBotRunsService } from './runs';

export const IBotsService: interfaces.ServiceIdentifier<IBotsService> =
  Symbol('BotsService');

export interface IBot {
  id: number;

  /**
   * The bot name, which can be referenced in the API endpoints.
   */
  name: string;

  /**
   * Enable or disable bot.
   */
  enabled: boolean;

  /**
   * The object type, which is always "bot".
   */
  object: 'bot';

  /**
   * The Unix timestamp (in seconds) when the model was created.
   */
  created: number;
}

export interface IBotsPage {
  data: Array<IBot>;
  object: 'list';
}

export interface IBotsRunStats {
  success: 0;
  failure: 0;
  total: 0;
}

export interface IBotsService {
  readonly runs: IBotRunsService;

  /**
   * Retrieve the bot by name.
   *
   * @param name The bot name.
   */
  retrieve(name: string): Promise<IBot | undefined>;
  retrieve(name: string, rejectOnNotFound: true): Promise<IBot>;
  retrieve(name: string, rejectOnNotFound?: boolean): Promise<IBot | undefined>;

  /**
   * List all bots.
   */
  list(): Promise<IBotsPage>;

  /**
   * Start all bot.
   */
  start(): Promise<IBotsRunStats>;

  /**
   * Stop all bot.
   */
  stop(): Promise<IBotsRunStats>;
}
