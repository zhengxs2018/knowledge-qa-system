import { Readable } from 'node:stream';
import { TextEncoderStream } from 'node:stream/web';

import { inject, injectable } from 'inversify';

import { IBotsService } from '../../bots/bots';
import { IBotEventsService } from '../../bots/events';
import { IBotRunsService } from '../../bots/runs';
import { type IServerRouter, IServerRouterView } from './router';

@injectable()
export class BotsView implements IServerRouterView {
  constructor(
    @inject(IBotsService)
    private readonly bots: IBotsService,

    @inject(IBotRunsService)
    private readonly botRuns: IBotRunsService,

    @inject(IBotEventsService)
    private readonly botEvents: IBotEventsService,
  ) {}

  addRoutes(router: IServerRouter): void {
    router.get('/v1/bots', async ctx => {
      ctx.status = 200;
      ctx.type = 'application/json';
      ctx.body = await this.bots.list();
    });

    router.get('/v1/bots/:name/', async ctx => {
      const name = ctx.params.name;

      ctx.status = 200;
      ctx.type = 'application/json';
      ctx.body = await this.bots.retrieve(name);
    });

    router.post('/v1/bots/:name/runs', async ctx => {
      const name = ctx.params.name;

      ctx.status = 200;
      ctx.type = 'application/json';
      ctx.body = await this.botRuns.create(name);
    });

    router.get('/v1/bots/:name/runs/cancel', async ctx => {
      const name = ctx.params.name;

      ctx.status = 200;
      ctx.type = 'application/json';
      ctx.body = await this.botRuns.cancel(name);
    });

    router.get('/v1/bots/logs/', async ctx => {
      const ac = new AbortController();
      const stream = this.botEvents.logs(undefined, ac.signal);

      ctx.req.on('close', () => {
        ac.abort();
      });

      ctx.status = 200;
      ctx.type = 'text/event-stream';
      ctx.response.headers['Cache-Control'] = 'no-cache';
      ctx.body = Readable.fromWeb(stream.pipeThrough(new TextEncoderStream()));
    });

    router.get('/v1/bots/:name/logs', ctx => {
      const name = ctx.params.name;

      const ac = new AbortController();
      const stream = this.botEvents.logs(name, ac.signal);

      ctx.req.on('close', () => {
        ac.abort();
      });

      ctx.status = 200;
      ctx.type = 'text/event-stream';
      ctx.response.headers['Cache-Control'] = 'no-cache';
      ctx.body = Readable.fromWeb(stream.pipeThrough(new TextEncoderStream()));
    });
  }
}
