import { fileURLToPath } from 'node:url';

import { IConfigurationService } from './base/common/configuration/configuration';
import { ConfigurationService } from './base/common/configuration/configurationService';
import {
  IEnvironmentService,
  type IParsedArgs,
} from './base/common/environment/environment';
import { EnvironmentService } from './base/common/environment/environmentService';
import { IFileService } from './base/common/files/files';
import { FileService } from './base/common/files/filesService';
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

export class MainApplition {
  toNodeHandler() {
    const [container] = this.createServices();
    return new MainServer(container).toNodeHandler();
  }

  createServices() {
    const args = this.resolveArgs();
    const environmentService = new EnvironmentService(args);
    const configurationService = new ConfigurationService(environmentService);
    const fileService = new FileService(environmentService);

    // Common
    GlobalContainer.bind(IEnvironmentService).toConstantValue(
      environmentService,
    );
    GlobalContainer.bind(IConfigurationService).toConstantValue(
      configurationService,
    );
    GlobalContainer.bind(IFileService).toConstantValue(fileService);

    // Database
    GlobalContainer.bind(IDatabaseService)
      .to(DatabaseService)
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
      fileService,
    ] as const;
  }

  private resolveArgs(): IParsedArgs {
    return {
      appRoot: fileURLToPath(new URL('..', import.meta.url)),
    };
  }
}
