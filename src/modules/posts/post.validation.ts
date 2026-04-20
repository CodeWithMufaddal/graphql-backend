import { z } from 'zod';

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

export type CreatePostInput = z.infer<typeof createPostInputSchema>;
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
