import bytes from 'bytes';
import { get as env } from 'env-var';

export type CliOptions = {};

export const MAX_HEAP_SIZE = bytes.parse(
  env('MAX_HEAP_SIZE').default('256mb').asString(),
);
