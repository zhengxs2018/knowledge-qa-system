import { type interfaces } from 'inversify';

export interface IParsedArgs {
  verbose?: boolean;
  name?: string;
  appRoot: string;
  loglevel?: string;
  logsPath?: string;
  homeDir?: string;
  tmpDir?: string;
}

export const IEnvironmentService: interfaces.ServiceIdentifier<IEnvironmentService> =
  Symbol('EnvironmentService');

export interface IEnvironmentService {
  verbose: boolean;

  appName: string;
  appRoot: string;

  tmpDir: string;

  userHome: string;
  userDataDir: string;

  logsHome: string;
  logLevel?: string;
}
