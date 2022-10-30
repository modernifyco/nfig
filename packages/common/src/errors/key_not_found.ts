import { NotFound } from './not_found';

export class ConfigNotFound extends NotFound {
  constructor({
    appName,
    envName,
    key,
  }: {
    appName: string;
    envName: string;
    key: string;
  }) {
    super(`No configuration key found '${appName}/${envName}/${key}'.`);

    // set stacktrace
    Error.captureStackTrace(this, ConfigNotFound);

    // Set prototype to make instanceOf enabled
    Object.setPrototypeOf(this, ConfigNotFound.prototype);
  }
}
