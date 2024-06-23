import { inject, injectable } from 'inversify';
import { toSafeInteger } from 'lodash-es';

import {
  Configuration,
  IConfigurationService,
} from '../../base/common/configuration/configuration';
import { IFilesStorageService } from '../../storage/files';
import multer from '../middlewares/multer';
import { type IServerRouter, IServerRouterView } from './router';

@injectable()
export class FilesView implements IServerRouterView {
  private readonly config: Configuration;

  constructor(
    @inject(IConfigurationService)
    configurationService: IConfigurationService,

    @inject(IFilesStorageService)
    private readonly filesStorage: IFilesStorageService,
  ) {
    this.config = configurationService.getConfiguration('storage.files');
  }

  addRoutes(router: IServerRouter): void {
    const { config } = this;

    // TODO impl custom storage engine
    // TODO Check the setting for allowed MIME types
    const upload = multer({
      limits: {
        fileSize: config.get<number>('maxBytes', 20 * 1024 * 1024),
      },
    });

    router.get('/v1/files', async ctx => {
      ctx.status = 200;
      ctx.type = 'application/json';
      ctx.body = await this.filesStorage.list();
    });

    router.post('/v1/files', upload.single('file'), async ctx => {
      const { file } = ctx;

      ctx.status = 200;
      ctx.type = 'application/json';
      ctx.body = await this.filesStorage.create({
        filename: file.filename ?? file.originalname,
        content: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
      });
    });

    router.get('/v1/files/:id(\\d+)', async ctx => {
      const id = toSafeInteger(ctx.params.id);
      const file = await this.filesStorage.content(id);

      ctx.status = 200;
      ctx.type = file.mimetype;
      ctx.response.headers['content-disposition'] =
        `attachment; filename="${file.filename}"`;
      ctx.body = file.content;
    });

    router.del('/v1/files/:id(\\d+)', async ctx => {
      const id = toSafeInteger(ctx.params.id);

      ctx.status = 200;
      ctx.type = 'application/json';
      ctx.body = await this.filesStorage.del(id);
    });
  }
}
