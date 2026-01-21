import { z } from 'zod';

export const getClassSuggestionsSchema = z.object({
  skill: z.string().min(1),
  category: z.string().optional(),
});

export const requestClassSuggestionSchema = z.object({
  skill: z.string().min(1).max(100),
  category: z.string().optional(),
  message: z.string().max(500).optional(),
  preferredVenueId: z.string().uuid().optional(),
});
