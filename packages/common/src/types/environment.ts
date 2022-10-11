import { Primitives } from './primitives';

export interface Environment {
  /**
   * Application name
   */
  readonly name: string;

  /**
   * Environment config
   */
  readonly config: Record<string, Primitives>;
}
