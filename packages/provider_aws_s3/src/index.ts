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
   * Prefix (S3 object prefix = root path)
   */
  prefix?: string;
};

export class AwsS3Provider implements Provider {
  protected readonly s3Client: S3Client;

  protected readonly bucketName: string;
  protected readonly prefix: string;

  constructor(opts?: AwsS3ProviderOptions) {
    if (typeof opts?.s3Client === 'undefined' || opts?.s3Client === null) {
      throw new ApplicationError(
        's3Client must be a valid instance of S3Client (AWS SDK v3)',
        {
          code: 'E_INVALID_S3_CLIENT',
        },
      );
    }

    if (isNonEmptyString(opts?.bucketName) === false) {
      throw new ApplicationError('Bucket name must be a non-empty string.', {
        code: 'E_INVALID_BUCKET_NAME',
      });
    }

    this.s3Client = opts.s3Client;
    this.bucketName = opts.bucketName;
    this.prefix = opts.prefix ?? '.config';
  }

  protected async getFileList(pattern: RegExp): Promise<Array<string>> {
    const res = await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: this.prefix,
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
      [this.prefix, `${appName ?? '*'}.${envName ?? '*'}.env`]
        .filter(isNonEmptyString)
        .join('/'),
    );
  }

  protected getEnvFilePath(appName: string, envName: string): string {
    return [this.prefix, `${appName}.${envName}.env`]
      .filter(isNonEmptyString)
      .join('/');
  }

  protected async readEnvConfig(
    appName: string,
    envName: string,
  ): Promise<EnvConfig | undefined> {
    const objectKey = this.getEnvFilePath(appName, envName);

    try {
      // read file content
      const res = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: objectKey,
        }),
      );

      if (typeof res.Body === 'undefined') {
        throw new ApplicationError(
          `Failed to read config file '${objectKey}'`,
          {
            code: 'E_READ_CONFIG_FAILED',
          },
        );
      }

      // read the content and transform to utf-8
      const body = await res.Body.transformToString('utf-8');

      // parse env vars
      return parseEnvFile(body!);
    } catch (err) {
      if (this.isS3NotFoundError(err) === false) {
        throw err;
      }
    }

    return undefined;
  }

  protected isS3NotFoundError(err: any): boolean {
    return typeof err.Code === 'string' && err.Code === 'NoSuchKey';
  }

  protected async writeEnvConfig(
    appName: string,
    envName: string,
    configs: EnvConfig,
  ): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
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
    const envFiles = await this.getFileList(pattern);

    return envFiles.reduce(async (accPromise, filePath) => {
      const fileName = basename(filePath, undefined);
      const [appName, envName] = fileName.split('.');

      const acc = await accPromise;

      // safely create application or use existing one
      acc[appName] = acc[appName] ?? {};

      const envConfig = await this.readEnvConfig(appName, envName);

      if (typeof envConfig !== 'undefined') {
        // safely create env or use existing one
        acc[appName][envName] = acc[appName][envName] ?? {};

        // read file content
        acc[appName][envName] = envConfig;
      }

      return acc;
    }, Promise.resolve({} as Record<string, AppConfig>));
  }

  async getAll(): Promise<Record<string, AppConfig>> {
    const pattern = this.getEnvFilePattern();
    return this.readFiles(pattern);
  }

  async clear(): Promise<void> {
    const pattern = this.getEnvFilePattern();
    const envFiles = await this.getFileList(pattern);
    for (const objectKey of envFiles) {
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: objectKey,
          }),
        );
      } catch (err) {
        if (this.isS3NotFoundError(err) === false) {
          throw err;
        }
      }
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
      this.writeEnvConfig(appName, envName, config[envName]);
    }
  }

  async deleteAppConfig(appName: string): Promise<void> {
    const pattern = this.getEnvFilePattern(appName);
    const envFiles = await this.getFileList(pattern);
    for (const objectKey of envFiles) {
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: objectKey,
          }),
        );
      } catch (err) {
        if (this.isS3NotFoundError(err) === false) {
          throw err;
        }
      }
    }
  }

  async getEnvConfig(
    appName: string,
    envName: string,
  ): Promise<EnvConfig | undefined> {
    return await this.readEnvConfig(appName, envName);
  }

  async setEnvConfig(
    appName: string,
    envName: string,
    config: EnvConfig,
  ): Promise<void> {
    await this.writeEnvConfig(appName, envName, config);
  }

  async deleteEnvConfig(appName: string, envName: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: this.getEnvFilePath(appName, envName),
        }),
      );
    } catch (err) {
      if (this.isS3NotFoundError(err) === false) {
        throw err;
      }
    }
  }

  async getConfig(
    appName: string,
    envName: string,
    key: string,
  ): Promise<string | undefined> {
    const envConfig = await this.readEnvConfig(appName, envName);
    return typeof envConfig === 'undefined' ? undefined : envConfig[key];
  }

  async setConfig(
    appName: string,
    envName: string,
    key: string,
    val: string,
  ): Promise<void> {
    let envConfig = await this.readEnvConfig(appName, envName);

    envConfig = envConfig ?? {};
    envConfig[key] = val;

    await this.writeEnvConfig(appName, envName, envConfig);
  }

  async deleteConfig(
    appName: string,
    envName: string,
    key: string,
  ): Promise<void> {
    const envConfig = await this.readEnvConfig(appName, envName);

    if (typeof envConfig === 'undefined') {
      return;
    }

    delete envConfig[key];
    await this.writeEnvConfig(appName, envName, envConfig);
  }
}
