import Conf from 'conf';
import { hasIn } from 'lodash-es';

import type { IEnvironmentService } from '../environment/environment';
import { Emitter, type Event } from '../event';
import {
  Configuration,
  type IConfigurationChangeEvent,
  type IConfigurationService,
} from './configuration';
import { IConfigurationDefaults } from './defaults';

export class ConfigurationService implements IConfigurationService {
  private readonly _store: Conf;

  private readonly _onDidChangeConfiguration: Emitter<IConfigurationChangeEvent>;
  public readonly onDidChangeConfiguration: Event<IConfigurationChangeEvent>;

  constructor(environmentService: IEnvironmentService) {
    const { userDataDir, appName } = environmentService;

    this._store = new Conf({
      cwd: userDataDir,
      projectName: appName,
      configName: 'settings',
      schema: IConfigurationDefaults,
    });

    this._onDidChangeConfiguration = new Emitter<IConfigurationChangeEvent>();
    this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;

    this._store.onDidAnyChange(newValue => {
      const event: IConfigurationChangeEvent = {
        affectsConfiguration(section: string) {
          return hasIn(newValue, section);
        },
      };

      this._onDidChangeConfiguration.fire(event);
    });
  }

  getConfigration(selection: string) {
    return new Configuration(this._store, selection);
  }
}
