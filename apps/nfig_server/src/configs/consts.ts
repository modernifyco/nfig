import { get as env } from 'env-var';
import * as bytes from 'bytes';

export enum API_VERSIONS {
  v1 = '1',

  default = '1',
}

export const MAX_HEAP_SIZE = bytes.parse(
  env('MAX_HEAP_SIZE').default('256mb').asString(),
);
