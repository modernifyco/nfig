import { Environment } from './environment';

export interface Application {
  /**
   * Application name
   */
  readonly name: string;

  /**
   * Application environments
   */
  readonly environments: Array<Environment>;
}
