import { Router } from 'express';
import {
  createClass,
  getClasses,
  getNearbyClasses,
  getClass,
  enrollInClass,
  cancelEnrollment,
  getMyClasses,
} from '../controllers/classController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { validateQuery } from '../middleware/validateQuery.js';
import {
  createClassSchema,
  nearbyClassesSchema,
} from '../validations/classValidation.js';
import { upload } from '../utils/upload.js';

const router = Router();

router.get('/nearby', optionalAuth, validateQuery(nearbyClassesSchema), getNearbyClasses);
router.get('/my-classes', authenticate, getMyClasses);
router.get('/', optionalAuth, getClasses);
router.get('/:id', optionalAuth, getClass);
router.post('/', authenticate, upload.single('image'), validateRequest(createClassSchema), createClass);
router.post('/:id/enroll', authenticate, enrollInClass);
router.delete('/:id/enroll', authenticate, cancelEnrollment);

export default router;
