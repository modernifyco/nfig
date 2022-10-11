import { ApplicationError } from 'error-lib';

export class ConfigNotFound extends ApplicationError {
  constructor(paramName: string) {
    super(`No parameter found named ${paramName}.`, undefined, {
      code: 'E_NOT_FOUND',
    });

    // set stacktrace
    Error.captureStackTrace(this, ConfigNotFound);

    // Set prototype to make instanceOf enabled
    Object.setPrototypeOf(this, ConfigNotFound.prototype);
  }
}
