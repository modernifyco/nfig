import { basename } from 'node:path';
import { EOL } from 'node:os';

import { parse as parseEnvFile } from 'dotenv';
import { AppConfig, EnvConfig, Provider } from 'nfig-common';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ApplicationError } from 'error-lib';

import { isNonEmptyString } from './utils';

export type AwsS3ProviderOptions = {
  /**
   * AWS S3 client (SDK v3)
   */
  s3Client: S3Client;

  /**
   * S3 bucket name
   */
  bucketName: string;

  /**
   * Root path/prefix to look for the config file
   */
  prefix: string;
};

const DEFAULT_CONFIG: Partial<AwsS3ProviderOptions> = {
  /**
   * It's a good idea to add a object-key prefix (e.g. nfig_) to prevent any conflict with the currently existing files
   * so that we can use nfig within a shared folder without any conflicts
   */
  prefix: '.config/nfig_',
};

export class AwsS3Provider implements Provider {
  protected readonly opts: AwsS3ProviderOptions;

  constructor(opts?: AwsS3ProviderOptions) {
    const safeOpts = {
      ...DEFAULT_CONFIG,
      ...opts,
    } as AwsS3ProviderOptions;

    if (
      typeof safeOpts.s3Client === 'undefined' ||
      safeOpts.s3Client === null
    ) {
      throw new ApplicationError(
        's3Client must be a valid instance of S3Client (AWS SDK v3)',
      );
    }

    if (isNonEmptyString(safeOpts.bucketName) === false) {
      throw new ApplicationError('Bucket name must be a non-empty string.', {
        code: 'E_INVALID_BUCKET_NAME',
      });
    }

    // we safely checked the provided values
    this.opts = { ...safeOpts };
  }

  protected async listFiles(pattern?: RegExp): Promise<Array<string>> {
    const res = await this.opts.s3Client.send(
      new ListObjectsV2Command({
        Bucket: this.opts.bucketName,
        Prefix: this.opts.prefix,
      }),
    );

    const allFiles = res.Contents?.map((_) => _.Key!) ?? [];

    if (typeof pattern === 'undefined') {
      return allFiles;
    }

    return allFiles.filter((_) => pattern.test(_));
  }

  protected getEnvFilePattern(appName?: string, envName?: string): RegExp {
    return new RegExp(
      [this.opts.prefix, `${appName ?? '*'}.${envName ?? '*'}.env`]
        .filter(isNonEmptyString)
        .join('/'),
    );
  }

  protected getEnvFilePath(appName: string, envName: string): string {
    return [this.opts.prefix, appName, envName]
      .filter(isNonEmptyString)
      .join('/');
  }

  protected async readConfig(
    appName: string,
    envName: string,
  ): Promise<EnvConfig> {
    // read file content
    const res = await this.opts.s3Client.send(
      new GetObjectCommand({
        Bucket: this.opts.bucketName,
        Key: this.getEnvFilePath(appName, envName),
      }),
    );

    // read the content and transform to utf-8
    const body = await res.Body?.transformToString('utf-8');

    // parse env vars
    return parseEnvFile(body!);
  }

  protected async writeConfig(
    appName: string,
    envName: string,
    configs: EnvConfig,
  ): Promise<void> {
    await this.opts.s3Client.send(
      new PutObjectCommand({
        Bucket: this.opts.bucketName,
        Key: this.getEnvFilePath(appName, envName),
        Body: Object.keys(configs)
          .reduce<Array<string>>((acc, key) => {
            // convert property name and its value to a key/value pair
            acc.push(`${key}=${configs[key]}`);
            return acc;
          }, [])
          // EOL is os-specific character that determines end-of-line
          .join(EOL),
      }),
    );
  }

  protected async readFiles(
    pattern: RegExp,
  ): Promise<Record<string, AppConfig>> {
    const envFiles = await this.listFiles(pattern);

    return envFiles.reduce(async (accPromise, filePath) => {
      const fileName = basename(filePath, undefined);
      const [appName, envName] = fileName.split('.');

      const acc = await accPromise;

      // safely create application or use existing one
      acc[appName] = acc[appName] ?? {};

      // safely create env or use existing one
      acc[appName][envName] = acc[appName][envName] ?? {};

      // read file content
      acc[appName][envName] = await this.readConfig(appName, envName);

      return acc;
    }, Promise.resolve({} as Record<string, AppConfig>));
  }

  async getAll(): Promise<Record<string, AppConfig>> {
    const pattern = this.getEnvFilePattern();
    return this.readFiles(pattern);
  }

  async clear(): Promise<void> {
    const pattern = this.getEnvFilePattern();
    const envFiles = await this.listFiles(pattern);

    for (const objectKey of envFiles) {
      await this.opts.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.opts.bucketName,
          Key: objectKey,
        }),
      );
    }
  }

  async getAppConfig(appName: string): Promise<AppConfig | undefined> {
    const pattern = this.getEnvFilePattern(appName);
    // read all the files
    const configs = await this.readFiles(pattern);
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
    const pattern = this.getEnvFilePattern(appName);
    const allFiles = await this.listFiles(pattern);

    if (allFiles.length === 0) {
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

  async deleteConfig(
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
