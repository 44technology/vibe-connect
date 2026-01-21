import { z } from 'zod';

export const createMatchSchema = z.object({
  receiverId: z.string().uuid(),
});

export const updateMatchSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
});
