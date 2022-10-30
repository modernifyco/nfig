import { NotFound } from './not_found';

export class EnvNotFound extends NotFound {
  constructor({ appName, envName }: { appName: string; envName: string }) {
    super(`No environment found '${appName}/${envName}'.`);

    // set stacktrace
    Error.captureStackTrace(this, EnvNotFound);

    // Set prototype to make instanceOf enabled
    Object.setPrototypeOf(this, EnvNotFound.prototype);
  }
}
