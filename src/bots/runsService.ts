import { eq } from 'drizzle-orm';
import assert from 'http-assert';
import { inject, injectable } from 'inversify';
import type { Wechaty } from 'wechaty';

import { lazyInject } from '../base/common/decorators';
import { IDatabaseService } from '../database/database';
import type { Table } from '../database/schema/schema';
import { IBotsService } from './bots';
import { IBotEventsService } from './events';
import type { IBotRun, IBotRunsService } from './runs';
import { createBotPuppetFromWechaty } from './vendors/wechaty';

@injectable()
export class BotRunsService implements IBotRunsService {
  private readonly puppets: Map<string, Wechaty> = new Map();

  // Note: BotsService and BotRunsService depend on each other,
  // in order to avoid circular dependency problems,
  // should use the property injection.
  @lazyInject(IBotsService)
  readonly bots!: IBotsService;

  constructor(
    @inject(IDatabaseService)
    private readonly db: IDatabaseService,

    @inject(IBotEventsService)
    private readonly events: IBotEventsService,
  ) {
    this.puppets = new Map();
  }

  async create(name: string): Promise<IBotRun> {
    const puppet = this.puppets.get(name);

    if (puppet) {
      return this.maybeRun(puppet);
    }

    const run = await this.getOrCreateRun(name);

    // Note: We should always make sure that the run object exists
    // so that the puppet updates it at runtime
    this.maybePuppetRun(run);

    return run;
  }

  async cancel(name: string): Promise<IBotRun> {
    const puppet = this.puppets.get(name);
    const error = await puppet?.stop().catch(error => error as Error);

    const run = await this.retrieve(name, true);

    if (error) {
      return {
        id: run?.id ?? -1,
        botId: run?.botId ?? -1,
        instanceId: run?.instanceId,
        name: name,
        message: error.message,
        status: 'failed',
        object: 'bot.run',
        created: Date.now(),
      };
    }

    assert(run, 503, `Bot(${name}) run object not found`);

    return {
      id: run.id,
      botId: run.botId,
      instanceId: run.instanceId,
      name: name,
      status: 'stopped',
      message: 'Bot run stopped',
      object: 'bot.run',
      created: Date.now(),
    };
  }

  async online(name: string): Promise<boolean> {
    const puppet = this.puppets.get(name);

    if (!puppet) return false;

    await puppet.ready();

    return puppet.isLoggedIn;
  }

  // TODO support run id
  retrieve(name: string): Promise<IBotRun | undefined>;
  retrieve(name: string, rejectOnNotFound: true): Promise<IBotRun>;
  async retrieve(
    name: string,
    rejectOnNotFound?: boolean,
  ): Promise<IBotRun | undefined> {
    const run = await this.db.query('botRuns').findFirst({
      where: (fields, { eq }) => eq(fields.name, name),
    });

    // TODO: Maybe we should check if the puppet exists?
    if (!run) {
      assert(!rejectOnNotFound, 503, `Bot(${name}) run object not found`);
      return;
    }

    return {
      id: run.id,
      botId: run.botId,
      instanceId: run.instanceId,
      name: run.name,
      status: run.status,
      message: run.message,
      object: 'bot.run',
      created: Date.now(),
    };
  }

  private async getOrCreateRun(name: string): Promise<IBotRun> {
    const thing = await this.retrieve(name);

    if (thing) {
      return thing;
    }

    const bot = await this.bots.retrieve(name, true);

    assert(bot.enabled, 503, `Bot(${name}) is not enabled`);

    const [run] = await this.db
      .insert('botRuns')
      .values({
        botId: bot.id,
        name: bot.name,
        status: 'init',
        message: 'Waiting for scan code',
      })
      .returning();

    return {
      id: run.id,
      botId: run.botId,
      instanceId: run.instanceId,
      name: run.name,
      status: run.status,
      message: run.message,
      object: 'bot.run',
      created: Date.now(),
    };
  }

  private async maybeRun(puppet: Wechaty): Promise<IBotRun> {
    const name = puppet.name();

    const thing = await this.retrieve(name);

    // TODO: Maybe we should check the status of the puppet
    assert(thing, 503, `Bot(${name}) during run status missing.`);

    return thing;
  }

  private async maybePuppetRun(run: IBotRun): Promise<void> {
    let puppet: Wechaty | undefined;
    try {
      puppet = createBotPuppetFromWechaty(run);
    } catch (error) {
      console.error(error);
    }

    if (!puppet) return;

    const puppets = this.puppets;
    const name = run.name;

    // Note: This ensures that duplicate requests do not create duplicate puppets
    puppets.set(name, puppet);

    try {
      await this.runInWithPuppet(puppet, run.id);
    } catch (error) {
      // TODO Need to do an automatic retry?
      puppets.delete(name);
      console.error(error);
    }
  }

  private async runInWithPuppet(puppet: Wechaty, runId: number) {
    const { puppets } = this;

    const name = puppet.name();

    puppet.on('start', () => {
      this.updateStatus(runId, 'waiting', 'Waiting for users to scan the code');
      this.events.onStart(puppet);
    });

    puppet.on('scan', (qrcode, status) => {
      this.updateStatus(runId, 'scaning', `Scan QR code is status(${status})`);
      this.events.onScan(puppet, qrcode, status);
    });

    puppet.on('stop', () => {
      puppets.delete(name);

      this.updateStatus(runId, 'stopped', 'Bot stop.');
      this.events.onStop(puppet);
    });

    puppet.on('logout', user => {
      puppets.delete(name);

      this.updateStatus(runId, 'logout', `Bot(${user.name()}) logout.`);
      this.events.onLogout(puppet, user);
    });

    puppet.on('login', user => {
      this.updateStatus(runId, 'login', `Bot(${user.name()}) login.`);
      this.events.onLogin(puppet, user);
    });

    puppet.on('error', error => {
      console.error(
        '%s [ERROR] Bot(%s) run failed',
        new Date().toLocaleString(),
        name,
        error.message,
      );

      // TODO: Maybe we should restart or stop?
      // puppets.delete(name);

      this.updateStatus(runId, 'failed', error.message);
      this.events.onError(puppet, error);
    });

    puppet.on('message', message => {
      this.events.onMessage(puppet, message);
    });

    await puppet.start();
  }

  private async updateStatus(
    id: number,
    status: Table.BotRunStatus,
    message: string,
  ) {
    const { db } = this;
    const fields = db.fields('botRuns');

    try {
      await this.db
        .update('botRuns')
        .set({ status, message })
        .where(eq(fields.id, id));
    } catch (error) {
      console.error(error);
    }
  }
}
