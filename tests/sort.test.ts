import { describe, expect, it } from 'vitest';

import { AppError } from '../src/utils/errors';
import { assertSortableField, normalizeSortInput } from '../src/utils/sort';

describe('sort helpers', () => {
  it('uses a default field and ASC order when options are missing', () => {
    expect(normalizeSortInput(undefined, 'id')).toEqual({
      field: 'id',
      order: 'ASC',
    });
  });

  it('keeps supported fields', () => {
    expect(assertSortableField('email', ['id', 'email'])).toBe('email');
  });

  it('throws a typed error for unknown sort fields', () => {
    expect(() => assertSortableField('passwordHash', ['id', 'email'])).toThrowError(
      AppError,
    );
  });
});
