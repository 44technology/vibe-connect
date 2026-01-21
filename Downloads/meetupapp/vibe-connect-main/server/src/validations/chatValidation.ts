import { z } from 'zod';

export const createChatSchema = z.object({
  userId: z.string().uuid(),
  meetupId: z.string().uuid().optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const createGroupChatSchema = z.object({
  name: z.string().min(1).max(100),
  userIds: z.array(z.string().uuid()).min(1),
  meetupId: z.string().uuid().optional(),
});
