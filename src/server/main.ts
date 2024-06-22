import KoaRouter from '@koa/router';
import { Container } from 'inversify';
import Koa from 'koa';

import { IServerApp } from './app';
import { BotsView } from './router/bots';
import { HomeView } from './router/home';
import { IServerRouter, IServerRouterView } from './router/router';

export class MainServer extends Koa implements IServerApp {
  private readonly router: KoaRouter;

  constructor(private readonly container: Container) {
    super();

    this.router = new KoaRouter();

    container.bind(IServerApp).toConstantValue(this);
    container.bind(IServerRouter).toConstantValue(this.router);

    container.bind(IServerRouterView).to(HomeView);
    container.bind(IServerRouterView).to(BotsView);
  }

  toNodeHandler() {
    return this.initApp().callback();
  }

  initApp() {
    const router = this.initRouter();

    this.use(router.routes());
    this.use(router.allowedMethods());

    return this;
  }

  private initRouter() {
    const container = this.container;
    const router = this.router;

    const views = container.getAll(IServerRouterView);
    views.forEach(view => view.addRoutes(router));

    return router;
  }
}
