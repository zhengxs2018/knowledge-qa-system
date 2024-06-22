import assert from 'http-assert';
import { inject, injectable } from 'inversify';

import { lazyInject } from '../base/common/decorators';
import { IDatabaseService } from '../database/database';
import type { Table } from '../database/schema/schema';
import type { IBot, IBotsPage, IBotsRunStats, IBotsService } from './bots';
import { IBotRunsService } from './runs';

@injectable()
export class BotsService implements IBotsService {
  // Note: BotsService and BotRunsService depend on each other,
  // in order to avoid circular dependency problems,
  // should use the property injection.
  @lazyInject(IBotRunsService)
  readonly runs!: IBotRunsService;

  constructor(
    @inject(IDatabaseService)
    private readonly db: IDatabaseService,
  ) {}

  retrieve(name: string): Promise<IBot | undefined>;
  retrieve(name: string, rejectOnNotFound: true): Promise<IBot>;
  async retrieve(
    name: string,
    rejectOnNotFound?: boolean,
  ): Promise<IBot | undefined> {
    const bot = await this.db.query('bots').findFirst({
      where: (cols, { eq, and }) => {
        return and(eq(cols.name, name), eq(cols.enabled, true));
      },
    });

    if (!bot) {
      assert(
        rejectOnNotFound,
        503,
        `The bot object does not exist or is not enabled`,
      );
      return;
    }

    return toBotObject(bot);
  }

  async list(): Promise<IBotsPage> {
    const data = await this.db.query('bots').findMany({
      where: (fields, { eq }) => {
        return eq(fields.enabled, true);
      },
    });

    return {
      data: data.map(toBotObject),
      object: 'list',
    };
  }

  // Note: Individual wechat accounts used on wechat4u-puppet may exited for any reason.
  // It might be possible to block a personal account if an automatic restart of the program is taken?
  async start(): Promise<IBotsRunStats> {
    return this.dispatch('start');
  }

  async stop(): Promise<IBotsRunStats> {
    return this.dispatch('stop');
  }

  private async dispatch(action: 'start' | 'stop') {
    const list = await this.list();

    const runs = this.runs;

    const results = await Promise.allSettled(
      list.data.map(bot => {
        if (action === 'start') {
          return runs.create(bot.name);
        }

        return runs.cancel(bot.name);
      }),
    );

    const stats: IBotsRunStats = {
      success: 0,
      failure: 0,
      total: 0,
    };

    for (const result of results) {
      // TODO: Check if the bot is running
      if (result.status === 'fulfilled') {
        stats.success += 1;
      } else {
        stats.failure += 1;
      }
      stats.total += 1;
    }

    return stats;
  }
}

function toBotObject(bot: Table.BotSelect): IBot {
  return {
    id: bot.id,
    name: bot.name,
    enabled: bot.enabled,
    object: 'bot',
    created: Date.now(),
  };
}
