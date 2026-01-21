import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  searchUsers,
  getUserStats,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { updateProfileSchema } from '../validations/userValidation.js';
import { upload } from '../utils/upload.js';

const router = Router();

router.get('/search', authenticate, searchUsers);
router.get('/stats/:userId?', authenticate, getUserStats);
router.get('/:userId?', authenticate, getProfile);
router.put('/', authenticate, validateRequest(updateProfileSchema), updateProfile);
router.post('/avatar', authenticate, upload.single('image'), uploadAvatar);

export default router;
