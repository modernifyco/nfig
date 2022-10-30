import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join as joinPath, resolve as resolvePath } from 'node:path';
import { EOL } from 'node:os';

import { parse as parseEnvFile } from 'dotenv';
import { AppConfig, EnvConfig, Provider } from 'nfig-common';
import glob from 'glob';

import { isNonEmptyString } from './utils';

export type FileSystemProviderOptions = {
  rootDir: string;
};

export class FileSystemProvider implements Provider {
  protected readonly opts: FileSystemProviderOptions;

  constructor(opts?: FileSystemProviderOptions) {
    this.opts = opts ?? {
      rootDir: resolvePath(process.cwd()),
    };

    if (
      isNonEmptyString(this.opts.rootDir) === false ||
      existsSync(this.opts.rootDir) === false
    ) {
      throw new Error(
        `Provided rootDir ('${this.opts.rootDir}') must be a valid and existed directory.`,
      );
    }
  }

  protected findFiles(pattern: string, opts?: glob.IOptions): Array<string> {
    return glob.sync(pattern, {
      ...(opts ?? {}),
      cwd: this.opts.rootDir,
    });
  }

  protected getFilePathOrPattern(appName?: string, envName?: string): string {
    return resolvePath(
      joinPath(this.opts.rootDir, `${appName ?? '*'}.${envName ?? '*'}.env`),
    );
  }

  protected readConfig(appName: string, envName: string): EnvConfig {
    // read file content
    const fileContent = readFileSync(
      this.getFilePathOrPattern(appName, envName),
      'utf-8',
    );

    // parse env vars
    return parseEnvFile(fileContent);
  }

  protected writeConfig(
    appName: string,
    envName: string,
    configs: EnvConfig,
  ): void {
    writeFileSync(
      // file path
      this.getFilePathOrPattern(appName, envName),
      // file content
      Object.keys(configs)
        .reduce<Array<string>>((acc, key) => {
          // convert property name and its value to a key/value pair
          acc.push(`${key}=${configs[key]}`);

          return acc;
        }, [])
        // EOL is os-specific character that determines end-of-line
        .join(EOL),
    );
  }

  protected readFiles(pattern: string): Record<string, AppConfig> {
    const files = this.findFiles(pattern);

    return files.reduce((acc, fileName) => {
      const [appName, envName] = fileName.split('.');

      // safely create application or use existing one
      acc[appName] = acc[appName] ?? {};

      // safely create env or use existing one
      acc[appName][envName] = acc[appName][envName] ?? {};

      // read file content
      acc[appName][envName] = this.readConfig(appName, envName);

      return acc;
    }, {} as Record<string, AppConfig>);
  }

  protected checkPatternHasMatch(pattern: string): boolean {
    return glob.sync(pattern, { cwd: this.opts.rootDir }).length > 0;
  }

  async getAll(): Promise<Record<string, AppConfig>> {
    const pattern = this.getFilePathOrPattern();
    return this.readFiles(pattern);
  }

  async clear(): Promise<void> {
    const pattern = this.getFilePathOrPattern();
    const files = this.findFiles(pattern);

    // unlink/delete files
    files.forEach(unlinkSync);
  }

  async getAppConfig(appName: string): Promise<AppConfig | undefined> {
    const pattern = this.getFilePathOrPattern(appName);

    // ensure at least one file is matched with the pattern
    if (this.checkPatternHasMatch(pattern) === false) {
      return undefined;
    }

    // read all the files
    const configs = this.readFiles(pattern);

    // filter by appName
    return configs[appName];
  }

  async setAppConfig(appName: string, config: AppConfig): Promise<void> {
    // iterate over environment names
    for (const envName in config) {
      // write environment configuration to a dedicated file prefixed with the app name
      this.writeConfig(appName, envName, config[envName]);
    }
  }

  async deleteAppConfig(appName: string): Promise<void> {
    const pattern = this.getFilePathOrPattern(appName);

    if (this.checkPatternHasMatch(pattern) === false) {
      return;
    }

    // find files matching with the pattern
    const files = this.findFiles(pattern);

    // unlink/delete file(s)
    files.forEach(unlinkSync);
  }

  async getEnvConfig(
    appName: string,
    envName: string,
  ): Promise<EnvConfig | undefined> {
    const pattern = this.getFilePathOrPattern(appName, envName);

    if (this.checkPatternHasMatch(pattern) === false) {
      return undefined;
    }

    const configs = this.readFiles(pattern);

    return configs[appName][envName];
  }

  async setEnvConfig(
    appName: string,
    envName: string,
    config: EnvConfig,
  ): Promise<void> {
    this.writeConfig(appName, envName, config);
  }

  async deleteEnvConfig(appName: string, envName: string): Promise<void> {
    const pattern = this.getFilePathOrPattern(appName, envName);

    if (this.checkPatternHasMatch(pattern) === false) {
      return;
    }

    // find files matching with the pattern
    const files = this.findFiles(pattern);

    // unlink/delete file(s)
    files.forEach(unlinkSync);
  }

  async getConfig(
    appName: string,
    envName: string,
    key: string,
  ): Promise<string | undefined> {
    const pattern = this.getFilePathOrPattern(appName, envName);

    if (this.checkPatternHasMatch(pattern) === false) {
      return undefined;
    }

    const configs = this.readFiles(pattern);

    return configs[appName][envName][key];
  }

  async setConfig(
    appName: string,
    envName: string,
    key: string,
    val: string,
  ): Promise<void> {
    const currentConfig = await this.getEnvConfig(appName, envName);

    // configuration not found (either app or env)
    if (typeof currentConfig === 'undefined') {
      // create a new configuration
      this.writeConfig(appName, envName, {
        [key]: val,
      });
      return;
    }

    // write to the file
    await this.setEnvConfig(appName, envName, {
      // clone current configuration
      ...currentConfig,
      // add/update configuration
      [key]: val,
    });
  }

  async delConfig(
    appName: string,
    envName: string,
    key: string,
  ): Promise<void> {
    const currentConfig = await this.getEnvConfig(appName, envName);

    // configuration not found (either app or env)
    if (typeof currentConfig === 'undefined') {
      // create a new configuration
      this.writeConfig(appName, envName, {});
      return;
    }

    // exclude requested key from config
    const updatedConfig = Object.keys(currentConfig)
      .filter((_) => _ !== key)
      .reduce((acc, key) => {
        acc[key] = currentConfig[key];
        return acc;
      }, {} as Record<string, string>);

    // write to the file
    await this.setEnvConfig(appName, envName, updatedConfig);
  }
}
