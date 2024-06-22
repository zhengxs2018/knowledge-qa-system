import KoaRouter from '@koa/router';
import { type interfaces } from 'inversify';

export const IServerRouter: interfaces.ServiceIdentifier<IServerRouter> =
  Symbol('ServerRouter');

export interface IServerRouter extends KoaRouter {
  // pass
}

export const IServerRouterView: interfaces.ServiceIdentifier<IServerRouterView> =
  Symbol('RouterView');

export interface IServerRouterView {
  addRoutes(router: IServerRouter): void;
}
