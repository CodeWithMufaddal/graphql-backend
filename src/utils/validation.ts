import { z } from 'zod';

import { AppError } from './errors';

export function parseInput<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  input: unknown,
): z.infer<TSchema> {
  const result = schema.safeParse(input);

  if (!result.success) {
    const flattened = z.flattenError(result.error);
    const fieldErrors = Object.entries(flattened.fieldErrors).flatMap(
      ([field, messages]) =>
        (messages ?? []).map((message) => ({
          field,
          message,
        })),
    );

    throw new AppError(
      'VALIDATION_ERROR',
      'Input validation failed.',
      422,
      fieldErrors.length > 0 ? fieldErrors : flattened.formErrors,
    );
  }

  return result.data;
}

