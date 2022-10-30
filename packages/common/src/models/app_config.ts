import { EnvConfig } from './env_config';

/**
 * App config is an object that
 * keys are environment names
 * values are key/value pairs
 *
 * let appConfig: AppConfig = {
 *   'dev': {
 *     'ENV_VAR_1': 'ENV_VAL_1',
 *     'ENV_VAR_2': 'ENV_VAR_2',
 *     'ENV_VAR_3': 'prefixed_$ENV_VAR_1',
 *   }
 * }
 */
export type AppConfig = Record<string, EnvConfig>;
