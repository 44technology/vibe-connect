import { z } from 'zod';

export const createLearnRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  skill: z.string().min(1).max(100),
  category: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const createResponseSchema = z.object({
  message: z.string().min(1).max(1000),
  price: z.number().positive().optional(),
  availability: z.string().max(200).optional(),
  responseType: z.enum(['USER', 'VENUE']).default('USER'),
  venueId: z.string().uuid().optional(),
});

export const updateLearnRequestStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']),
});
