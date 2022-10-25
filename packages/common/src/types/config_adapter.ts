import { Primitives } from './primitives';

export interface ConfigAdapter {
  /* Adapter-level methods */

  /**
   * Add a new configuration
   * @param key Configuration key
   * @param value Configuration value
   */
  add(key: string, value: Primitives): Promise<ConfigAdapter>;

  /**
   * Remove a configuration by its key
   * @param key Configuration key
   */
  remove(key: string): Promise<ConfigAdapter>;

  /**
   * Update a configuration value
   * @param key Configuration key
   * @param value New value
   */
  update(key: string, value: Primitives): Promise<ConfigAdapter>;

  /**
   * Remove all the configuration keys
   */
  clear(): Promise<ConfigAdapter>;

  /* Application-level methods */

  /**
   * Check configuration existence
   * @param key Configuration key
   */
  exist(key: string): Promise<boolean>;

  /**
   * Return a value by its key (throws error if not found)
   * @param key Configuration key
   */
  get<U = Primitives>(key: string): Promise<U>;

  /**
   * Try getting a value (returns undefined if does not exist)
   * @param key
   */
  tryGet<U = Primitives>(key: string): Promise<U | undefined>;

  /**
   * List all the values as a dictionary
   */
  list(): Promise<Record<string, Primitives>>;
}
