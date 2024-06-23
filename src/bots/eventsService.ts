import { EventEmitter } from 'node:events';
import { ReadableStream } from 'node:stream/web';

import { injectable } from 'inversify';
import type { Contact, Message, Wechaty } from 'wechaty';

import type { IBotEventsService } from './events';

export interface IBotLog {
  bot: {
    id: string;
    name: string;
  };
  event: 'start' | 'stop' | 'error' | 'scan' | 'login' | 'logout' | 'message';
  level: 'info' | 'error';
  message: string;
  stack?: string;
  time: string;
}

@injectable()
export class BotEventsService implements IBotEventsService {
  private readonly emitter = new EventEmitter();

  async onStart(puppet: Wechaty): Promise<void> {
    const log: IBotLog = {
      bot: {
        id: puppet.id,
        name: puppet.name(),
      },
      event: 'start',
      level: 'info',
      message: 'started',
      time: logtime(),
    };

    console.info('%s [%s] Puppet(%s)', log.time, log.bot.name, log.message);
    this.emitter.emit('log', log);
  }

  async onStop(puppet: Wechaty): Promise<void> {
    const log: IBotLog = {
      bot: {
        id: puppet.id,
        name: puppet.name(),
      },
      event: 'start',
      level: 'info',
      message: 'stopped',
      time: logtime(),
    };

    console.info('%s [%s] Puppet(%s)', log.time, log.bot.name, log.message);
    this.emitter.emit('log', log);
  }

  async onError(puppet: Wechaty, error: Error): Promise<void> {
    const log: IBotLog = {
      bot: {
        id: puppet.id,
        name: puppet.name(),
      },
      event: 'start',
      level: 'error',
      message: error.message,
      stack: error.stack,
      time: logtime(),
    };

    console.error('%s [%s] Puppet(%s)', log.time, log.bot.name, log.message);
    this.emitter.emit('log', log);
  }

  async onScan(puppet: Wechaty, qrcode: string, status: number): Promise<void> {
    const log: IBotLog = {
      bot: {
        id: puppet.id,
        name: puppet.name(),
      },
      event: 'start',
      level: 'info',
      message: `Scan QR Code to login: ScanStatus(${status}) ${qrcode}`,
      time: logtime(),
    };

    console.info('%s [%s] Puppet(%s)', log.time, log.bot.name, log.message);
    this.emitter.emit('log', log);
  }

  async onLogin(puppet: Wechaty, user: Contact): Promise<void> {
    const log: IBotLog = {
      bot: {
        id: puppet.id,
        name: puppet.name(),
      },
      event: 'start',
      level: 'info',
      message: `${user.name()} logged in`,
      time: logtime(),
    };

    console.info('%s [%s] Puppet(%s)', log.time, log.bot.name, log.message);
    this.emitter.emit('log', log);
  }

  async onLogout(puppet: Wechaty, user: Contact): Promise<void> {
    const log: IBotLog = {
      bot: {
        id: puppet.id,
        name: puppet.name(),
      },
      event: 'start',
      level: 'info',
      message: `${user.name()} logged out`,
      time: logtime(),
    };

    console.info('%s [%s] Puppet(%s)', log.time, log.bot.name, log.message);
    this.emitter.emit('log', log);
  }

  async onMessage(puppet: Wechaty, message: Message) {
    const talker = message.talker();
    const room = message.room();

    const msgType = message.type();

    const log: IBotLog = {
      bot: {
        id: puppet.id,
        name: puppet.name(),
      },
      event: 'start',
      level: 'info',
      message: `receive ${talker.name()}(${talker.type()}) message(${msgType}) from ${room ? `room(${room.topic()})` : 'individual'}`,
      time: logtime(),
    };

    console.info('%s [%s] Puppet(%s)', log.time, log.bot.name, log.message);
    this.emitter.emit('log', log);
  }

  logs(name: string | undefined, signal: AbortSignal): ReadableStream<string> {
    return new ReadableStream<string>({
      start: controller => {
        controller.enqueue('Listen on logs stream. \n\n');

        const onLog = (log: IBotLog) => {
          if (signal.aborted) return;

          if (name && log.bot.name !== name) return;

          controller.enqueue(`${log.time} [${log.bot.name}] ${log.message} \n`);
        };

        this.emitter.on('log', onLog);

        signal.addEventListener('abort', () => {
          this.emitter.off('scan', onLog);

          if (signal.aborted) return;

          controller.close();
        });
      },
    });
  }
}

function logtime() {
  return new Date().toLocaleString();
}
