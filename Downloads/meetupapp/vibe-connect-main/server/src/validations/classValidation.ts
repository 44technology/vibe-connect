import { z } from 'zod';

export const createClassSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  skill: z.string().min(1).max(100),
  category: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  maxStudents: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  schedule: z.string().max(200).optional(),
  venueId: z.string().uuid(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const nearbyClassesSchema = z.object({
  latitude: z.string().transform((val) => parseFloat(val)),
  longitude: z.string().transform((val) => parseFloat(val)),
  radius: z.string().optional().transform((val) => val ? parseFloat(val) : 10),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 20),
}).refine((data) => !isNaN(data.latitude) && data.latitude >= -90 && data.latitude <= 90, {
  message: 'Latitude must be between -90 and 90',
}).refine((data) => !isNaN(data.longitude) && data.longitude >= -180 && data.longitude <= 180, {
  message: 'Longitude must be between -180 and 180',
});
