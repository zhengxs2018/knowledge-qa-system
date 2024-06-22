import { type interfaces } from 'inversify';
import Koa from 'koa';

export const IServerApp: interfaces.ServiceIdentifier<IServerApp> =
  Symbol('ServerApp');

export interface IServerApp extends Koa {
  // urlFor
}
