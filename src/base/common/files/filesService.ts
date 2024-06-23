import { randomUUID } from 'node:crypto';
import type { Abortable } from 'node:events';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  type ReadStream,
} from 'node:fs';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { IEnvironmentService } from '../environment/environment';
import type {
  FileWriteOptions,
  FsFileLike,
  FsFileReadOptions,
  FsReadStreamOptions,
  IFilesService,
  IFsWriteResult,
} from './files';

export class FilesService implements IFilesService {
  constructor(private readonly environmentService: IEnvironmentService) {
    mkdirSync(this.toPath(), { recursive: true });
  }

  readFile(
    key: string,
    options: FsFileReadOptions | undefined | null,
  ): Promise<Buffer>;

  readFile(
    key: string,
    options:
      | ({
          encoding: BufferEncoding;
          flag?: string | undefined;
        } & Abortable)
      | BufferEncoding,
  ): Promise<string>;

  readFile(
    key: string,
    options:
      | FsFileReadOptions
      | ({
          encoding: BufferEncoding;
          flag?: string | undefined;
        } & Abortable)
      | BufferEncoding
      | undefined
      | null,
  ): Promise<string | Buffer> {
    return readFile(this.toPath(key), options);
  }

  async writeFile(
    file: FsFileLike,
    options?: FileWriteOptions | BufferEncoding,
  ): Promise<IFsWriteResult> {
    const key = randomUUID();
    const path = this.toPath(key);

    // TODO Writing and generating hash using duplex streams
    await writeFile(path, file, options);

    return {
      key: key,
    };
  }

  unlink(key: string): Promise<void> {
    const path = this.toPath(key);

    if (existsSync(path)) {
      return unlink(path);
    }

    return Promise.resolve();
  }

  exists(key: string): boolean {
    return existsSync(this.toPath(key));
  }

  readFileWithStream(
    key: string,
    options?: FsReadStreamOptions | BufferEncoding,
  ): ReadStream {
    return createReadStream(this.toPath(key), options);
  }

  private toPath(...paths: string[]) {
    return path.join(this.environmentService.userDataDir, 'files', ...paths);
  }
}
