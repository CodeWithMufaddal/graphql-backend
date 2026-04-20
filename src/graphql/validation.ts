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

export const registerInputSchema = z.object({
  name: z.string().trim().min(1),
  username: z.string().trim().min(3),
  email: z.email(),
  password: z.string().min(8),
  phone: z.string().trim().optional().nullable(),
  website: z.string().trim().optional().nullable(),
});

export const loginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const createUserInputSchema = registerInputSchema.extend({
  password: z.string().min(8).optional().nullable(),
});

export const updateUserInputSchema = z.object({
  name: z.string().trim().min(1).optional().nullable(),
  username: z.string().trim().min(3).optional().nullable(),
  email: z.email().optional().nullable(),
  password: z.string().min(8).optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  website: z.string().trim().optional().nullable(),
});

export const createPostInputSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  userId: z.union([z.string(), z.number().int()]).optional().nullable(),
});

export const updatePostInputSchema = z.object({
  title: z.string().trim().min(1).optional().nullable(),
  body: z.string().trim().min(1).optional().nullable(),
  userId: z.union([z.string(), z.number().int()]).optional().nullable(),
});

