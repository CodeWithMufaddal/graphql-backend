import { z } from 'zod';

export const pageQueryOptionsSchema = z
  .object({
    paginate: z
      .object({
        page: z.number().int().positive().optional().nullable(),
        limit: z.number().int().positive().optional().nullable(),
      })
      .optional()
      .nullable(),
    search: z
      .object({
        q: z.string().trim().optional().nullable(),
      })
      .optional()
      .nullable(),
    sort: z
      .object({
        field: z.string().trim().optional().nullable(),
        order: z.enum(['ASC', 'DESC']).optional().nullable(),
      })
      .optional()
      .nullable(),
    slice: z
      .object({
        start: z.number().int().optional().nullable(),
        end: z.number().int().optional().nullable(),
      })
      .optional()
      .nullable(),
    operators: z
      .array(
        z.object({
          field: z.string(),
          operator: z.string(),
          value: z.string().optional().nullable(),
        }),
      )
      .optional()
      .nullable(),
  })
  .optional()
  .nullable();

export type PageQueryOptionsInput = z.infer<typeof pageQueryOptionsSchema>;
