import { NotFound } from './not_found';

export class AppNotFound extends NotFound {
  constructor({ appName }: { appName: string }) {
    super(`No application found named '${appName}'.`);

    // set stacktrace
    Error.captureStackTrace(this, AppNotFound);

    // Set prototype to make instanceOf enabled
    Object.setPrototypeOf(this, AppNotFound.prototype);
  }
}
