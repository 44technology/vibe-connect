import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  password: z.string().min(6).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  displayName: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  authProvider: z.enum(['EMAIL', 'PHONE', 'GOOGLE', 'APPLE']).default('EMAIL'),
  providerId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  password: z.string().min(6),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  displayName: z.string().optional(),
  bio: z.string().max(500).optional(),
  dateOfBirth: z.string().datetime().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const verifyPhoneSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  code: z.string().length(6),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});
