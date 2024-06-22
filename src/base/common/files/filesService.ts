import type { Abortable } from 'node:events';
import type { Mode, ObjectEncodingOptions, OpenMode } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Stream } from 'node:stream';

import { inject, injectable } from 'inversify';

import { IEnvironmentService } from '../environment/environment';
import type { IFileService } from './files';

@injectable()
export class FileService implements IFileService {
  constructor(
    @inject(IEnvironmentService)
    private readonly environmentService: IEnvironmentService,
  ) {}

  readFile(
    path: string,
    options?:
      | ({
          encoding?: null | undefined;
          flag?: OpenMode | undefined;
        } & Abortable)
      | null,
  ): Promise<Buffer>;

  readFile(
    path: string,
    options:
      | ({
          encoding: BufferEncoding;
          flag?: OpenMode | undefined;
        } & Abortable)
      | BufferEncoding,
  ): Promise<string>;

  readFile(
    path: string,
    options?:
      | ({
          encoding?: BufferEncoding | null;
          flag?: OpenMode | undefined;
        } & Abortable)
      | BufferEncoding
      | null
      | undefined,
  ): Promise<Buffer | string> {
    return readFile(this.joinPath(path), options);
  }

  async writeFile(
    path: string,
    data:
      | string
      | NodeJS.ArrayBufferView
      | Iterable<string | NodeJS.ArrayBufferView>
      | AsyncIterable<string | NodeJS.ArrayBufferView>
      | Stream,
    options?:
      | (ObjectEncodingOptions & {
          mode?: Mode | undefined;
          flag?: OpenMode | undefined;
          flush?: boolean | undefined;
        } & Abortable)
      | BufferEncoding
      | null,
  ) {
    return writeFile(this.joinPath(path), data, options);
  }

  joinPath(...paths: string[]) {
    return path.join(this.environmentService.userDataDir, ...paths);
  }
}
