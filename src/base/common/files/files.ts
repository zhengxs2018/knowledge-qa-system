import type { Abortable } from 'node:events';
import type { Mode, ObjectEncodingOptions, OpenMode } from 'node:fs';
import type { Stream } from 'node:stream';

import { type interfaces } from 'inversify';

export const IFileService: interfaces.ServiceIdentifier<IFileService> =
  Symbol('FileService');

export interface IFileService {
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

  writeFile(
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
  ): Promise<void>;

  joinPath(...paths: string[]): string;
}
