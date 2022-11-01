import { Connection, Repository } from 'typeorm';
import { AppConfig, EnvConfig, Provider } from 'nfig-common';
import { Config } from './models';

export type DatabaseProviderOptions = {
  connection: Connection;
};

export class DatabaseProvider implements Provider {
  protected readonly connection: Connection;
  protected readonly repository: Repository<Config>;

  constructor(opts?: DatabaseProviderOptions) {
    // ensure opts is not null/undefined
    opts ||= {} as any;

    if (typeof opts!.connection === 'undefined') {
      throw new Error('Please provide database connection.');
    }

    this.connection = opts!.connection;
    this.repository = opts!.connection.getRepository(Config);
  }

  async getAll(): Promise<Record<string, AppConfig>> {
    const configs = await this.repository.find();

    return configs.reduce<Record<string, AppConfig>>((acc, _) => {
      acc[_.appName] ||= {};
      acc[_.appName][_.envName] ||= {};

      acc[_.appName][_.envName][_.key] = _.val;

      return acc;
    }, {});
  }

  async clear(): Promise<void> {
    await this.repository.delete({});
  }

  async getAppConfig(appName: string): Promise<AppConfig | undefined> {
    const configs = await this.repository.find({ where: { appName } });

    if (configs.length === 0) {
      return undefined;
    }

    return configs.reduce<AppConfig>((acc, _) => {
      acc[_.envName] ||= {};
      acc[_.envName][_.key] = _.val;

      return acc;
    }, {});
  }

  async setAppConfig(appName: string, config: AppConfig): Promise<void> {
    await this.repository.save(
      Object.keys(config)
        .map((envName) => {
          return Object.keys(config[envName]).map((key) => ({
            appName,
            envName,
            key,
            val: config[envName][key],
          }));
        })
        .flat(),
    );
  }

  async deleteAppConfig(appName: string): Promise<void> {
    await this.repository.delete({ appName });
  }

  async getEnvConfig(
    appName: string,
    envName: string,
  ): Promise<EnvConfig | undefined> {
    const configs = await this.repository.find({ where: { appName, envName } });

    if (configs.length === 0) {
      return undefined;
    }

    return configs.reduce<EnvConfig>((acc, _) => {
      acc[_.key] = _.val;
      return acc;
    }, {});
  }

  async setEnvConfig(
    appName: string,
    envName: string,
    config: EnvConfig,
  ): Promise<void> {
    await this.repository.save(
      Object.keys(config).map((key) => ({
        appName,
        envName,
        key,
        val: config[key],
      })),
    );
  }

  async deleteEnvConfig(appName: string, envName: string): Promise<void> {
    await this.repository.delete({
      appName,
      envName,
    });
  }

  async getConfig(
    appName: string,
    envName: string,
    key: string,
  ): Promise<string | undefined> {
    const config = await this.repository.findOne({
      where: { appName, envName, key },
    });

    return config?.val;
  }

  async setConfig(
    appName: string,
    envName: string,
    key: string,
    val: string,
  ): Promise<void> {
    await this.repository.save({
      appName,
      envName,
      key,
      val,
    });
  }

  async deleteConfig(
    appName: string,
    envName: string,
    key: string,
  ): Promise<void> {
    await this.repository.delete({
      appName,
      envName,
      key,
    });
  }
}
