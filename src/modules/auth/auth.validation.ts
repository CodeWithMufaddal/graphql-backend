import { z } from 'zod';

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

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
