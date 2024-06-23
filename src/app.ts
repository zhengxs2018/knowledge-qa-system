import { fileURLToPath } from 'node:url';

import { IConfigurationService } from './base/common/configuration/configuration';
import { ConfigurationService } from './base/common/configuration/configurationService';
import {
  IEnvironmentService,
  type IParsedArgs,
} from './base/common/environment/environment';
import { EnvironmentService } from './base/common/environment/environmentService';
import { IFilesService } from './base/common/files/files';
import { FilesService } from './base/common/files/filesService';
import { GlobalContainer } from './base/common/instantiation/instantiation';
import { IBotsService } from './bots/bots';
import { BotsService } from './bots/botsService';
import { IBotEventsService } from './bots/events';
import { BotEventsService } from './bots/eventsService';
import { IBotRunsService } from './bots/runs';
import { BotRunsService } from './bots/runsService';
import { IDatabaseService } from './database/database';
import { DatabaseService } from './database/databaseService';
import { MainServer } from './server/main';
import { IFilesStorageService } from './storage/files';
import { FilesStorageService } from './storage/filesService';

export class MainApplication {
  // TODO Use h3 and listhen to support deno, bun, serverless, etc.
  toNodeHandler() {
    const [container] = this.createServices();
    return new MainServer(container).toNodeHandler();
  }

  createServices() {
    const args = this.resolveArgs();
    const environmentService = new EnvironmentService(args);
    const configurationService = new ConfigurationService(environmentService);
    const filesService = new FilesService(environmentService);

    // Base
    GlobalContainer.bind(IEnvironmentService).toConstantValue(
      environmentService,
    );
    GlobalContainer.bind(IConfigurationService).toConstantValue(
      configurationService,
    );
    GlobalContainer.bind(IFilesService).toConstantValue(filesService);

    // Common Service
    GlobalContainer.bind(IDatabaseService)
      .to(DatabaseService)
      .inSingletonScope();
    GlobalContainer.bind(IFilesStorageService)
      .to(FilesStorageService)
      .inSingletonScope();

    // Bots
    GlobalContainer.bind(IBotsService).to(BotsService).inSingletonScope();
    GlobalContainer.bind(IBotRunsService).to(BotRunsService).inSingletonScope();
    GlobalContainer.bind(IBotEventsService)
      .to(BotEventsService)
      .inSingletonScope();

    return [
      GlobalContainer,
      environmentService,
      configurationService,
      filesService,
    ] as const;
  }

  private resolveArgs(): IParsedArgs {
    return {
      appRoot: fileURLToPath(new URL('..', import.meta.url)),
    };
  }
}
