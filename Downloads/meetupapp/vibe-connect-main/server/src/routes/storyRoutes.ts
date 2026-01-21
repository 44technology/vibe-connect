import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';
import { createStory, getStories, viewStory } from '../controllers/storyController.js';

const router = Router();

router.post('/', authenticate, upload.single('image'), createStory);
router.get('/', authenticate, getStories);
router.post('/:id/view', authenticate, viewStory);

export default router;
