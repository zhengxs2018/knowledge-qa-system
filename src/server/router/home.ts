import { injectable } from 'inversify';

import { type IServerRouter, IServerRouterView } from './router';

@injectable()
export class HomeView implements IServerRouterView {
  addRoutes(router: IServerRouter): void {
    router.get('/', ctx => {
      ctx.body = { message: '⚡️ hello,world!' };
    });
  }
}
