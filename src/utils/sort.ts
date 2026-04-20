import { AppError } from './errors';

export type SortOrder = 'ASC' | 'DESC';

export interface SortInput {
  field?: string | null;
  order?: SortOrder | null;
}

export function normalizeSortInput(
  input: SortInput | null | undefined,
  fallbackField: string,
) {
  return {
    field: input?.field?.trim() || fallbackField,
    order: input?.order === 'DESC' ? 'DESC' : 'ASC',
  } satisfies { field: string; order: SortOrder };
}

export function assertSortableField(field: string, allowedFields: string[]) {
  if (!allowedFields.includes(field)) {
    throw new AppError(
      'BAD_USER_INPUT',
      `Unsupported sort field "${field}".`,
      400,
      { allowedFields },
    );
  }

  return field;
}

