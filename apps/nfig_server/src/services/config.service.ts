import { Inject, Injectable } from '@nestjs/common';
import { flow } from 'lodash';
import { expand } from 'dotenv-expand';

import { Provider } from 'nfig-common';

// type ConfigRecord = {
//   appName: string;
//   envName: string;
//   key: string;
//   val: string;
// };

@Injectable()
export class ConfigService {
  constructor(protected readonly provider: Provider) {}

  protected groupConfigs(configs: Array<Config>): Record<string, AppConfigV1> {
    return configs.reduce((acc, config) => {
      // ensure app exist
      acc[config.appName] ||= {};
      // ensure environment exist
      acc[config.appName][config.envName] ||= {};
      // set key/value pair
      acc[config.appName][config.envName][config.key] = config.val;

      return acc;
    }, {} as Record<string, AppConfigV1>);
  }

  protected expandConfigs(
    configs: Record<string, AppConfigV1>,
  ): Record<string, AppConfigV1> {
    for (const appName in configs) {
      for (const envName in configs[appName]) {
        // read & expand the values
        const expandedObject = expand({
          ignoreProcessEnv: true,
          parsed: {
            ...configs[appName][envName],
          },
        });

        // assign to the object
        configs[appName][envName] = expandedObject.parsed;
      }
    }

    return configs;
  }

  protected processConfigs(
    configs: Array<Config>,
  ): Record<string, AppConfigV1> {
    return flow(this.groupConfigs, this.expandConfigs)(configs);
  }

  /* General services */

  async getAllApps(): Promise<Record<string, AppConfigV1>> {
    return this.processConfigs(
      await this.dataSource.getRepository(Config).find(),
    );
  }

  /* Application-level services */

  async setAppConfig(appName: string, config: AppConfigV1): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      const repo = queryRunner.connection.getRepository(Config);

      // delete current application configuration
      await repo.delete({ appName: appName });

      for (const envName in config) {
        for (const key in config[envName]) {
          this.dbInstance.data.configs.push({
            appName,
            envName,
            key,

            val: config[envName][key],
          });
        }
      }

      // save all the changes
      await queryRunner.commitTransaction();
    } catch (err) {
      // log the error

      // something bad happened! rollback changes
      await queryRunner.rollbackTransaction();
    } finally {
      // no matter what, release the lock
      await queryRunner.release();
    }
  }

  async getAppConfig(appName: string): Promise<AppConfigV1 | undefined> {
    await this.ensureInitialized();

    const configs = this.processConfigs(
      this.dbInstance.data.configs.filter((_) => _.appName === appName),
    );

    return configs[appName];
  }

  async deleteAppConfig(appName: string): Promise<void> {
    await this.ensureInitialized();

    // exclude requested application's configuration from database
    this.dbInstance.data.configs = this.dbInstance.data.configs.filter(
      (_) => _.appName !== appName,
    );

    // save the changes
    await this.dbInstance.write();
  }

  /* Environment-level services */

  async setEnvConfig(
    appName: string,
    envName: string,
    config: Record<string, string>,
  ): Promise<void> {
    await this.ensureInitialized();

    for (const key in config) {
      // delete previous key/value pair
      this.dbInstance.data.configs = this.dbInstance.data.configs.filter(
        (_) =>
          (_.appName === appName && _.envName === envName && _.key === key) ===
          false,
      );

      // insert new key/value pair
      this.dbInstance.data.configs.push({
        appName,
        envName,
        key,
        val: config[key],
      });
    }

    await this.dbInstance.write();
  }

  async getEnvConfig(
    appName: string,
    envName: string,
  ): Promise<Record<string, string> | undefined> {
    await this.ensureInitialized();

    const configs = this.processConfigs(
      this.dbInstance.data.configs.filter(
        (_) => _.appName === appName && _.envName === envName,
      ),
    );

    // ensure app exist before accessing nested properties
    if (typeof configs[appName] === 'undefined') {
      return undefined;
    }

    return configs[appName][envName];
  }

  async deleteEnvConfig(appName: string, envName: string): Promise<void> {
    await this.ensureInitialized();

    this.dbInstance.data.configs = this.dbInstance.data.configs.filter(
      (_) => (_.appName === appName && _.envName === envName) === false,
    );

    // save the changes
    await this.dbInstance.write();
  }

  /* Configuration-level endpoints */
  async setConfig(
    appName: string,
    envName: string,
    key: string,
    val: string,
  ): Promise<void> {
    await this.ensureInitialized();

    // delete previous key/value pair
    this.dbInstance.data.configs = this.dbInstance.data.configs.filter(
      (_) =>
        (_.appName === appName && _.envName === envName && _.key === key) ===
        false,
    );

    this.dbInstance.data.configs.push({
      appName,
      envName,
      key,
      val,
    });

    await this.dbInstance.write();
  }

  async getConfig(
    appName: string,
    envName: string,
    key: string,
  ): Promise<string | undefined> {
    await this.ensureInitialized();

    const configs = this.processConfigs(
      this.dbInstance.data.configs.filter(
        (_) => _.appName === appName && _.envName === envName,
      ),
    );

    // ensure app exist before accessing nested properties
    if (typeof configs[appName] === 'undefined') {
      return undefined;
    }

    if (typeof configs[appName][envName] === 'undefined') {
      return undefined;
    }

    return configs[appName][envName][key];
  }

  async deleteConfig(
    appName: string,
    envName: string,
    key: string,
  ): Promise<void> {
    await this.ensureInitialized();

    this.dbInstance.data.configs = this.dbInstance.data.configs.filter(
      (_) =>
        (_.appName === appName && _.envName === envName && _.key === key) ===
        false,
    );

    // save the changes
    await this.dbInstance.write();
  }
}
