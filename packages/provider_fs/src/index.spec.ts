import { join as joinPath } from 'node:path';
import { mkdirSync } from 'node:fs';
import rimraf from 'rimraf';

import { FileSystemProvider } from './index';

const APP_CONFIG = {
  dev: {
    NODE_ENV: 'dev',
    APP_VERSION: '0.0.1-alpha',
  },

  test: {
    NODE_ENV: 'test',
    APP_VERSION: '0.0.1-test',
  },

  prod: {
    NODE_ENV: 'prod',
    APP_VERSION: '0.0.1',
  },
};

describe('[nfig][provider][fs]', () => {
  const ROOT_DIR = joinPath(__dirname, 'tmp');
  let instance: FileSystemProvider;

  beforeAll(() => {
    mkdirSync(ROOT_DIR);
    instance = new FileSystemProvider({ rootDir: ROOT_DIR });
  });

  beforeEach(async () => {
    await instance.setAppConfig('app_1', APP_CONFIG);
    await instance.setAppConfig('app_2', APP_CONFIG);
  });

  afterEach(async () => {
    await instance.clear();
  });

  afterAll(() => {
    rimraf.sync(ROOT_DIR);
  });

  describe('setAppConfig', () => {
    test('save a new app config', async () => {
      await instance.setAppConfig('app_3', APP_CONFIG);

      const app3Config = await instance.getAppConfig('app_3');
      expect(app3Config).toEqual(APP_CONFIG);
    });

    test('overwrite app config', async () => {
      // delete test environment
      await instance.setAppConfig('app_1', {
        dev: { ...APP_CONFIG.dev },
        test: {
          ...APP_CONFIG.test,
          NODE_ENV: 'test_new',
          NEW_KEY: 'VALUE',
        },
        prod: { ...APP_CONFIG.prod },
      });

      const newConfig = await instance.getAppConfig('app_1');

      expect(newConfig).not.toBeUndefined();

      expect(newConfig).toHaveProperty('test');
      expect(newConfig!['test']).toStrictEqual({
        ...APP_CONFIG.test,
        NODE_ENV: 'test_new',
        NEW_KEY: 'VALUE',
      });
    });
  });

  describe('getAppConfig', () => {
    test('get non-existing app config returns undefined', async () => {
      const config = await instance.getAppConfig('non_existing_app');
      expect(config).toBeUndefined();
    });

    test('get app config by name', async () => {
      const config = await instance.getAppConfig('app_1');
      expect(config).toStrictEqual(APP_CONFIG);
    });
  });

  describe('deleteAppConfig', () => {
    test('delete app name completely', async () => {
      await instance.deleteAppConfig('app_1');

      const app1Config = await instance.getAppConfig('app_1');

      expect(app1Config).toBeUndefined();

      const configs = await instance.getAll();
      expect(Object.keys(configs)).toHaveLength(1);
    });

    test('delete non existing app', async () => {
      await instance.deleteAppConfig('non_existing_app');

      const configs = await instance.getAll();
      expect(Object.keys(configs)).toHaveLength(2);
    });
  });

  describe('getAll', () => {
    test('return default apps config', async () => {
      const configs = await instance.getAll();

      expect(Object.keys(configs)).toHaveLength(2);
      expect(Object.keys(configs)).toEqual(['app_1', 'app_2']);
    });

    test('return empty object if no config found', async () => {
      await instance.clear();
      const configs = await instance.getAll();
      expect(Object.keys(configs)).toHaveLength(0);
    });
  });

  describe('clear', () => {
    test('return no record after clearing configs', async () => {
      await instance.clear();

      const configs = await instance.getAll();
      expect(Object.keys(configs)).toHaveLength(0);
    });
  });

  describe('getEnvConfig', () => {
    test('get environment name', async () => {
      const envConfig = await instance.getEnvConfig('app_1', 'dev');
      expect(envConfig).toStrictEqual(APP_CONFIG.dev);
    });

    test('get non-existing application', async () => {
      const envConfig = await instance.getEnvConfig('invalid_app_1', 'dev');
      expect(envConfig).toBeUndefined();
    });

    test('get non-existing environment', async () => {
      const envConfig = await instance.getEnvConfig('app_1', 'invalid_env');
      expect(envConfig).toBeUndefined();
    });
  });

  describe('setEnvConfig', () => {
    test('set environment config to existing app', async () => {
      await instance.setEnvConfig('app_1', 'new_env', APP_CONFIG.dev);

      const envConfig = await instance.getEnvConfig('app_1', 'new_env');
      expect(envConfig).toStrictEqual(APP_CONFIG.dev);
    });

    test('set environment config on non-existing app', async () => {
      await instance.setEnvConfig('new_app', 'dev', APP_CONFIG.dev);
      const envConfig = await instance.getEnvConfig('new_app', 'dev');
      expect(envConfig).toStrictEqual(APP_CONFIG.dev);
    });

    test('set non-existing environment', async () => {
      await instance.setEnvConfig('app_1', 'new_env', APP_CONFIG.dev);
      const envConfig = await instance.getEnvConfig('app_1', 'new_env');
      expect(envConfig).toStrictEqual(APP_CONFIG.dev);
    });
  });

  describe('deleteEnvConfig', () => {
    test('delete env config', async () => {
      await instance.deleteEnvConfig('app_1', 'dev');

      const envConfig = await instance.getEnvConfig('app_1', 'dev');
      expect(envConfig).toBeUndefined();
    });

    test('delete env config from non-existing app', async () => {
      await instance.deleteEnvConfig('non_existing_app', 'dev');

      const configs = await instance.getAll();

      expect(Object.keys(configs)).toHaveLength(2);
      expect(Object.keys(configs)).toEqual(['app_1', 'app_2']);
    });

    test('delete non-existing environment', async () => {
      await instance.deleteEnvConfig('app_1', 'non_existing_env');

      const app1Config = await instance.getAppConfig('app_1');

      expect(app1Config).toStrictEqual(APP_CONFIG);
    });
  });

  describe('getConfig', () => {
    test('get config value', async () => {
      const config = await instance.getConfig('app_1', 'dev', 'NODE_ENV');
      expect(config).toBe('dev');
    });

    test('get config from non-existing app', async () => {
      const config = await instance.getConfig(
        'non_existing_app',
        'dev',
        'NODE_ENV',
      );
      expect(config).toBe(undefined);
    });

    test('get config from non-existing environment', async () => {
      const config = await instance.getConfig(
        'app_1',
        'non_existing_env',
        'NODE_ENV',
      );
      expect(config).toBe(undefined);
    });

    test('get non-existing config', async () => {
      const config = await instance.getConfig(
        'app_1',
        'dev',
        'non_existing_key',
      );
      expect(config).toBe(undefined);
    });
  });

  describe('setConfig', () => {
    test('set config value', async () => {
      await instance.setConfig('app_1', 'dev', 'NEW_KEY', 'NEW_VALUE');

      const config = await instance.getConfig('app_1', 'dev', 'NEW_KEY');
      expect(config).toBe('NEW_VALUE');
    });

    test('set config on non-existing app', async () => {
      await instance.setConfig(
        'non_existing_app',
        'dev',
        'NODE_ENV',
        'NEW_VALUE',
      );

      const config = await instance.getConfig(
        'non_existing_app',
        'dev',
        'NODE_ENV',
      );
      expect(config).toBe('NEW_VALUE');
    });

    test('set config on non-existing environment', async () => {
      await instance.setConfig('app_1', 'new_env', 'NEW_KEY', 'NEW_VALUE');

      const config = await instance.getConfig('app_1', 'new_env', 'NEW_KEY');
      expect(config).toBe('NEW_VALUE');
    });

    test('add new config', async () => {
      await instance.setConfig('app_1', 'new_env', 'NEW_KEY', 'NEW_VALUE');

      const config = await instance.getConfig('app_1', 'new_env', 'NEW_KEY');
      expect(config).toBe('NEW_VALUE');
    });
  });

  describe('deleteConfig', () => {
    test('delete config value', async () => {
      await instance.deleteConfig('app_1', 'dev', 'NODE_ENV');

      const config = await instance.getConfig('app_1', 'dev', 'NODE_ENV');
      expect(config).toBeUndefined();
    });

    test('delete config on non-existing app', async () => {
      await instance.setConfig(
        'non_existing_app',
        'dev',
        'NODE_ENV',
        'NEW_VALUE',
      );
    });

    test('delete config on non-existing environment', async () => {
      await instance.deleteConfig('app_1', 'new_env', 'NEW_KEY');
    });
  });
});
