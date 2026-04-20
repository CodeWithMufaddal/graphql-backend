import { z } from 'zod';

import { registerInputSchema } from '../auth/auth.validation';

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

export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
