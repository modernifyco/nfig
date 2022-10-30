import { ApplicationError } from 'error-lib';

export abstract class NotFound extends ApplicationError {
  constructor(message?: string) {
    super(message ?? 'Requested entity was not found', undefined, {
      code: 'E_NOT_FOUND',
    });

    // set stacktrace
    Error.captureStackTrace(this, NotFound);

    // Set prototype to make instanceOf enabled
    Object.setPrototypeOf(this, NotFound.prototype);
  }
}
