import { z } from 'zod';

export const createVenueSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  country: z.string().min(1),
  zipCode: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  amenities: z.array(z.string()).optional(),
});

export const updateVenueSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().optional(),
  country: z.string().min(1).optional(),
  zipCode: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  amenities: z.array(z.string()).optional(),
});

export const nearbyVenuesSchema = z.object({
  latitude: z.string().transform((val) => parseFloat(val)),
  longitude: z.string().transform((val) => parseFloat(val)),
  radius: z.string().optional().transform((val) => val ? parseFloat(val) : 10),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 20),
}).refine((data) => !isNaN(data.latitude) && data.latitude >= -90 && data.latitude <= 90, {
  message: 'Latitude must be between -90 and 90',
}).refine((data) => !isNaN(data.longitude) && data.longitude >= -180 && data.longitude <= 180, {
  message: 'Longitude must be between -180 and 180',
});
