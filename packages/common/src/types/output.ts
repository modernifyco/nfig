import { Primitives } from './primitives';

export interface Output {
  /**
   * Export configuration to the environment
   * @param config
   */
  export(config: Record<string, Primitives>): Promise<Output>;

  /**
   * Remove configuration from environment
   * @param config Configuration (only keys are used here)
   */
  clean(config: Record<string, Primitives>): Promise<Output>;
}
