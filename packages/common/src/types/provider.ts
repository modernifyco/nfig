import { AppConfig, EnvConfig } from '../models';

export interface Provider {
  /**
   * Get all configurations
   */
  getAll(): Promise<Record<string, AppConfig>>;

  /**
   * Clear all the configurations
   */
  clear(): Promise<void>;

  /* Application-level */

  /**
   * Get application configuration
   * @param appName Application name
   */
  getAppConfig(appName: string): Promise<AppConfig | undefined>;

  /**
   * Set (replace) application configuration
   * @param appName Application name
   * @param config New configuration
   */
  setAppConfig(appName: string, config: AppConfig): Promise<void>;

  /**
   * Delete application configuration
   * @param appName Application name
   */
  deleteAppConfig(appName: string): Promise<void>;

  /* Environment-level */

  /**
   * Get environment configuration
   * @param appName Application name
   * @param envName Environment name
   */
  getEnvConfig(
    appName: string,
    envName: string,
  ): Promise<EnvConfig | undefined>;

  /**
   * Set (replace) environment configuration
   * @param appName Application name
   * @param envName Environment name
   * @param config New configuration
   */
  setEnvConfig(
    appName: string,
    envName: string,
    config: EnvConfig,
  ): Promise<void>;

  /**
   * Delete environment configuration
   * @param appName Application name
   * @param envName Environment name
   */
  deleteEnvConfig(appName: string, envName: string): Promise<void>;

  /* Configuration-level endpoints */

  /**
   * Get configuration
   * @param appName Application name
   * @param envName Environment name
   * @param key Configuration key
   */
  getConfig(
    appName: string,
    envName: string,
    key: string,
  ): Promise<string | undefined>;

  /**
   * Set (replace) configuration
   * @param appName Application name
   * @param envName Environment name
   * @param key Configuration key
   * @param val New configuration value
   */
  setConfig(
    appName: string,
    envName: string,
    key: string,
    val: string,
  ): Promise<void>;

  /**
   * Delete configuration
   * @param appName Application name
   * @param envName Environment name
   * @param key Configuration key
   */
  delConfig(appName: string, envName: string, key: string): Promise<void>;
}
