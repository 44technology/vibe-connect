import { Router } from 'express';
import {
  getChats,
  getChat,
  createDirectChat,
  createGroupChat,
  sendMessage,
  getMessages,
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createChatSchema,
  sendMessageSchema,
  createGroupChatSchema,
} from '../validations/chatValidation.js';
import { upload } from '../utils/upload.js';

const router = Router();

router.get('/', authenticate, getChats);
router.get('/:id', authenticate, getChat);
router.get('/:id/messages', authenticate, getMessages);
router.post('/direct', authenticate, validateRequest(createChatSchema), createDirectChat);
router.post('/group', authenticate, validateRequest(createGroupChatSchema), createGroupChat);
router.post('/:id/messages', authenticate, upload.single('image'), validateRequest(sendMessageSchema), sendMessage);

export default router;
