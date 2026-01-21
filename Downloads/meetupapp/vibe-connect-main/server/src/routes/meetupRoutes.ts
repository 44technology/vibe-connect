import { Router } from 'express';
import {
  createMeetup,
  getMeetup,
  updateMeetup,
  deleteMeetup,
  getMeetups,
  getNearbyMeetups,
  joinMeetup,
  leaveMeetup,
} from '../controllers/meetupController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { validateQuery } from '../middleware/validateQuery.js';
import {
  createMeetupSchema,
  updateMeetupSchema,
  joinMeetupSchema,
  nearbyMeetupsSchema,
} from '../validations/meetupValidation.js';
import { upload } from '../utils/upload.js';

const router = Router();

router.get('/nearby', optionalAuth, validateQuery(nearbyMeetupsSchema), getNearbyMeetups);
router.get('/', optionalAuth, getMeetups);
router.get('/:id', optionalAuth, getMeetup);
router.post('/', authenticate, upload.single('image'), validateRequest(createMeetupSchema), createMeetup);
router.put('/:id', authenticate, upload.single('image'), validateRequest(updateMeetupSchema), updateMeetup);
router.delete('/:id', authenticate, deleteMeetup);
router.post('/:id/join', authenticate, validateRequest(joinMeetupSchema), joinMeetup);
router.delete('/:id/leave', authenticate, leaveMeetup);

export default router;
