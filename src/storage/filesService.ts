import { eq } from 'drizzle-orm';
import assert from 'http-assert';
import { inject, injectable } from 'inversify';
import { lookup } from 'mime-types';

import {
  fileContentToBytes,
  fileContentToHash,
  IFilesService,
} from '../base/common/files/files';
import { IDatabaseService } from '../database/database';
import type { Table } from '../database/schema/schema';
import {
  type FileCreateParams,
  type FileReadOptions,
  type IFile,
  type IFileContent,
  type IFileDeleted,
  type IFilesPage,
  type IFilesStorageService,
} from './files';

// TODO Object storage in third clouds, such as Qiniu
@injectable()
export class FilesStorageService implements IFilesStorageService {
  constructor(
    @inject(IDatabaseService)
    private readonly db: IDatabaseService,

    @inject(IFilesService)
    private readonly fs: IFilesService,
  ) {}

  async create(params: FileCreateParams): Promise<IFile> {
    const {
      filename,
      content,
      size,
      mimetype = lookup(filename),
      signal,
    } = params;

    const hash = await fileContentToHash(content);

    // Check if the file already exists.
    const thing = await this.getByHash(hash);

    if (thing) {
      return toFileObject(thing);
    }

    assert(mimetype, 400, `Invalid MIME type for file ${filename}.`);

    const { key } = await this.fs.writeFile(content, {
      signal,
    });

    const [result] = await this.db
      .insert('files')
      .values({
        filename: filename,
        mimetype: mimetype,
        key: key,
        hash: hash,
        size: size ?? fileContentToBytes(content),
        strategy: 'local',
      })
      .returning();

    return toFileObject(result);
  }

  async list(): Promise<IFilesPage> {
    const files = await this.db.query('files').findMany();

    return {
      data: files.map(toFileObject),
      object: 'list',
    };
  }

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

  /**
   * Returns information about a specific file.
   *
   * @param id The file id.
   * @param rejectOnNotFound If true, the method will reject the promise if the file is not found.
   * @returns The {@link IFile File} object matching the specified ID.
   */
  async retrieve(
    id: number,
    rejectOnNotFound?: boolean,
  ): Promise<IFile | undefined> {
    const file = await this.getById(id, rejectOnNotFound);
    return file ? toFileObject(file) : undefined;
  }

  async content(id: number, options?: FileReadOptions): Promise<IFileContent> {
    const file = await this.getById(id, true);
    const content = this.fs.readFileWithStream(file.key, options);
    return {
      filename: file.filename,
      content: content,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  /**
   * Delete a file.
   *
   * @param id The file id.
   */
  async del(id: number): Promise<IFileDeleted> {
    const file = await this.getById(id, true);

    try {
      await this.fs.unlink(file.key);

      const files = this.db.fields('files');
      await this.db.del('files').where(eq(files.id, id)).execute();

      return {
        id: file.id,
        object: 'file',
        deleted: true,
      };
    } catch (error) {
      console.error(`Failed to delete file(%d):`, file.id, error);

      return {
        id: file.id,
        object: 'file',
        deleted: false,
      };
    }
  }

  private getById(id: number): Promise<Table.FileSelect | undefined>;
  private getById(
    id: number,
    rejectOnNotFound?: boolean,
  ): Promise<Table.FileSelect | undefined>;
  private getById(
    id: number,
    rejectOnNotFound: true,
  ): Promise<Table.FileSelect>;
  private async getById(
    id: number,
    rejectOnNotFound?: boolean,
  ): Promise<Table.FileSelect | undefined> {
    const file = await this.db.query('files').findFirst({
      where: (fields, { eq }) => eq(fields.id, id),
    });

    assert(file || !rejectOnNotFound, 404, `File with id ${id} not found.`);

    return file;
  }

  private getByHash(hash: string): Promise<Table.FileSelect | undefined> {
    return this.db.query('files').findFirst({
      where: (fields, { eq }) => eq(fields.hash, hash),
    });
  }
}

function toFileObject(input: Table.FileSelect): IFile {
  return {
    id: input.id,
    filename: input.filename,
    size: input.size,
    mimetype: input.mimetype,
    object: 'file',
    createdAt: new Date(input.createdAt).getTime(),
  };
}
