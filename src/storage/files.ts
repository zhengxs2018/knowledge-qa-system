import type { Abortable } from 'node:events';
import type { ReadStream } from 'node:fs';

import { type interfaces } from 'inversify';

import type { FsFileLike } from '../base/common/files/files';

export const IFilesStorageService: interfaces.ServiceIdentifier<IFilesStorageService> =
  Symbol('FilesStorageService');

export interface IFile {
  /**
   * The file identifier, which can be referenced in the API endpoints.
   */
  id: number;

  /**
   * The file name.
   */
  filename: string;

  /**
   * The MIME type of the file.
   */
  mimetype: string;

  /**
   * The size of the file, in bytes.
   */
  size: number;

  /**
   * The object type, which is always "file".
   */
  object: 'file';

  /**
   * The Unix timestamp when the model was created.
   */
  createdAt: number;
}

export interface IFilesPage {
  data: Array<IFile>;
  object: 'list';
}

export interface IFileDeleted {
  id: number;
  object: 'file';
  deleted: boolean;
}

export interface FileCreateParams extends Abortable {
  /**
   * The file name.
   */
  filename: string;

  /**
   * The {@link FsFileLike File} object (not file name) to be uploaded.
   */
  content: FsFileLike;

  /**
   * The MIME type of the file.
   */
  mimetype?: string;

  /**
   * The size of the file, in bytes.
   */
  size?: number;
}

export interface IFileContent {
  /**
   * The file name.
   */
  filename: string;

  /**
   * The file content.
   */
  content: ReadStream;

  /**
   * The MIME type of the file.
   */
  mimetype: string;

  /**
   * The size of the file, in bytes.
   */
  size: number;
}

export interface FileReadOptions extends Abortable {
  encoding?: BufferEncoding | undefined;
}

export interface IFilesStorageService {
  /**
   * Upload a file that can be used across various endpoints.
   *
   * @param params
   */
  create(params: FileCreateParams): Promise<IFile>;

  /**
   * List all files.
   */
  list(): Promise<IFilesPage>;

  /**
   * Returns information about a specific file.
   *
   * @param id The file id.
   * @returns The {@link IFile File} object matching the specified ID.
   */
  retrieve(id: number): Promise<IFile | undefined>;

  /**
   * Returns information about a specific file.
   *
   * @param id The file id.
   * @param rejectOnNotFound If true, the method will reject the promise if the file is not found.
   * @returns The {@link IFile File} object matching the specified ID.
   */
  retrieve(id: number, rejectOnNotFound: true): Promise<IFile>;
  retrieve(id: number, rejectOnNotFound?: boolean): Promise<IFile | undefined>;

  /**
   * Get the content of a file.
   *
   * @param id The file id.
   * @param options The read stream options.
   * @returns The file content.
   */
  content(id: number, options?: FileReadOptions): Promise<IFileContent>;

  /**
   * Delete a file.
   *
   * @param id The file id.
   */
  del(id: number): Promise<IFileDeleted>;
}
