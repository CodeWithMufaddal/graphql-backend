import { AppError } from '../../utils/errors';

export function toIsoString(value: Date) {
  return value.toISOString();
}

export function ensureNonEmptyInput(input: object, entityName: string) {
  if (Object.keys(input).length === 0) {
    throw new AppError(
      'VALIDATION_ERROR',
      `At least one ${entityName} field must be provided.`,
      422,
    );
  }
}
