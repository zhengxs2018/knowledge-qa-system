import { WechatyBuilder } from 'wechaty';
import { EventLogger, Heartbeat, QRCodeTerminal } from 'wechaty-plugin-contrib';

import type { IBotRun } from '../runs';

// TODO support more puppet
export function createBotPuppetFromWechaty(run: IBotRun) {
  const bot = WechatyBuilder.build({
    name: run.name,
    puppet: 'wechaty-puppet-wechat4u',
    puppetOptions: {
      uos: true,
    },
  });

  bot.use(QRCodeTerminal({ small: true }));
  bot.use(
    Heartbeat({
      contact: 'filehelper',
      emoji: {
        heartbeat: '😎',
      },
      intervalSeconds: 60,
    }),
  );

  bot.use(
    EventLogger(['login', 'logout', 'error', 'friendship', 'room-invite']),
  );

  return bot;
}
