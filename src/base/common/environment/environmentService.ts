import { existsSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { memoize } from '../decorators';
import type { IEnvironmentService, IParsedArgs } from './environment';

export class EnvironmentService implements IEnvironmentService {
  constructor(private readonly args: IParsedArgs) {}

  @memoize
  get verbose(): boolean {
    return !!this.args.verbose;
  }

  @memoize
  get userHome(): string {
    return this.args.homeDir ?? os.homedir();
  }

  @memoize
  get tmpDir(): string {
    return this.args.tmpDir ?? os.tmpdir();
  }

  @memoize
  get appName(): string {
    return this.args.name ?? process.env.APP_NAME ?? 'hackai';
  }

  @memoize
  get appRoot(): string {
    return this.args.appRoot ?? process.cwd();
  }

  @memoize
  get userDataDir(): string {
    return mkdir(path.join(this.appRoot, `.${this.appName}`));
  }

  @memoize
  get logsHome(): string {
    if (!this.args.logsPath) {
      this.args.logsPath = mkdir(path.join(this.appRoot, 'logs'));
    }

    return this.args.logsPath;
  }

  @memoize
  get logLevel(): string | undefined {
    return this.logLevel;
  }
}

function mkdir(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }

  return path;
}
