import { z } from 'zod';

export const createMeetupSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  maxAttendees: z.number().int().positive().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  venueId: z.string().uuid().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  location: z.string().max(500).optional(), // Location name/address
  isPublic: z.boolean().default(true),
  isFree: z.boolean().default(true),
  pricePerPerson: z.number().positive().optional(),
  isBlindMeet: z.boolean().default(false),
});

export const updateMeetupSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  maxAttendees: z.number().int().positive().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  venueId: z.string().uuid().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  location: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
  isFree: z.boolean().optional(),
  pricePerPerson: z.number().positive().optional(),
  isBlindMeet: z.boolean().optional(),
  status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
});

export const joinMeetupSchema = z.object({
  status: z.enum(['going', 'maybe', 'not_going']).default('going'),
});

export const nearbyMeetupsSchema = z.object({
  latitude: z.string().transform((val) => parseFloat(val)),
  longitude: z.string().transform((val) => parseFloat(val)),
  radius: z.string().optional().transform((val) => val ? parseFloat(val) : 10),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 20),
}).refine((data) => !isNaN(data.latitude) && data.latitude >= -90 && data.latitude <= 90, {
  message: 'Latitude must be between -90 and 90',
}).refine((data) => !isNaN(data.longitude) && data.longitude >= -180 && data.longitude <= 180, {
  message: 'Longitude must be between -180 and 180',
});
