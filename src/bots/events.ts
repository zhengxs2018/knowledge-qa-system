import { ReadableStream } from 'node:stream/web';

import { type interfaces } from 'inversify';
import type { Contact, Message, Wechaty } from 'wechaty';

export const IBotEventsService: interfaces.ServiceIdentifier<IBotEventsService> =
  Symbol('BotEventsService');

export interface IBotEventsService {
  onStart(puppet: Wechaty): Promise<void>;
  onStop(puppet: Wechaty): Promise<void>;
  onError(puppet: Wechaty, error: Error): Promise<void>;

  onScan(puppet: Wechaty, qrcode: string, status: number): Promise<void>;
  onLogin(puppet: Wechaty, user: Contact): Promise<void>;
  onLogout(puppet: Wechaty, user: Contact): Promise<void>;

  onMessage(puppet: Wechaty, message: Message): Promise<void>;

  logs(name: string | undefined, signal: AbortSignal): ReadableStream<string>;
}
