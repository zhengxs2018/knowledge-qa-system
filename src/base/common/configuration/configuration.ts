import Conf from 'conf';
import { type interfaces } from 'inversify';

import { type Event } from '../event';

export const IConfigurationService: interfaces.ServiceIdentifier<IConfigurationService> =
  Symbol('ConfigurationService');

export class Configuration {
  constructor(
    private readonly store: Conf,
    private readonly namespace: string,
  ) {
    // pass
  }

  get<T>(selection: string): T | undefined;
  get<T>(selection: string, defaultValue: T): T;
  get<T>(selection: string, defaultValue?: T): T | undefined {
    return this.store.get(`${this.namespace}.${selection}`, defaultValue) as T;
  }

  update<T>(selection: string, value: T) {
    return this.store.set(`${this.namespace}.${selection}`, value);
  }

  has(section: string) {
    return this.store.has(section);
  }
}

export interface IConfigurationChangeEvent {
  /**
   * Returns `true` if the given section is affected in the provided scope.
   *
   * @param section - Configuration name, supports _dotted_ names.
   * @returns `true` if the given section is affected in the provided scope.
   */
  affectsConfiguration(section: string): boolean;
}

export interface IConfigurationService {
  onDidChangeConfiguration: Event<IConfigurationChangeEvent>;

  getConfigration(selection: string): Configuration;
}
