import { injectable } from 'inversify';

import { type IServerRouter, IServerRouterView } from './router';

@injectable()
export class HomeView implements IServerRouterView {
  addRoutes(router: IServerRouter): void {
    router.get('/', ctx => {
      ctx.status = 200;
      ctx.type = 'application/json';
      ctx.body = { message: '⚡️ hello,world!' };
    });
  }
}
