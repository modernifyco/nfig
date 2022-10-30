export const isNonEmptyString = (val?: any): boolean =>
  typeof val === 'string' && val.length > 0;
