import type { Abortable } from 'node:events';
import { type ObjectEncodingOptions, type OpenMode, ReadStream } from 'node:fs';
import { types } from 'node:util';

import { type interfaces } from 'inversify';

import { streamToHash, stringToHash } from '../hash';

export const IFilesService: interfaces.ServiceIdentifier<IFilesService> =
  Symbol('FilesService');

// TODO support File, Blob, and Buffer
export type FsFileLike = string | Buffer | NodeJS.ArrayBufferView | ReadStream;

export interface FsReadStreamOptions extends Abortable {
  flags?: string | undefined;
  mode?: number | undefined;
  encoding?: BufferEncoding | undefined;
  start?: number | undefined;
  end?: number | undefined;
}

export interface FileWriteOptions extends Abortable, ObjectEncodingOptions {
  flag?: OpenMode | undefined;
}

export interface FsFileReadOptions extends Abortable, ObjectEncodingOptions {
  flag?: string | undefined;
}

// TODO return file size
export interface IFsWriteResult {
  key: string;
}

export interface IFilesService {
  readFileWithStream(
    key: string,
    options?: FsReadStreamOptions | BufferEncoding,
  ): ReadStream;

  readFile(
    key: string,
    options?: FsFileReadOptions | undefined | null,
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

  writeFile(
    file: FsFileLike,
    options?: FileWriteOptions | BufferEncoding,
  ): Promise<IFsWriteResult>;

  exists(key: string): boolean;

  unlink(key: string): Promise<void>;
}

export async function fileContentToHash(content: FsFileLike): Promise<string> {
  if (typeof content === 'string') {
    return stringToHash(content);
  }

  if (content instanceof Buffer || types.isArrayBuffer(content)) {
    return stringToHash(Buffer.from(content).toString('utf-8'));
  }

  if (content instanceof ReadStream) {
    return streamToHash(content);
  }

  throw new Error('Unsupported file content type');
}

export function fileContentToBytes(content: FsFileLike): number {
  if (typeof content === 'string') {
    return Buffer.byteLength(content);
  }

  if (content instanceof ArrayBuffer) {
    return content.byteLength;
  }

  if (content instanceof ReadStream) {
    return content.bytesRead;
  }

  throw new Error('Unsupported file content type');
}
