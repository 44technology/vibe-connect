import { Router } from 'express';
import {
  createLearnRequest,
  getLearnRequests,
  getLearnRequest,
  createResponse,
  updateLearnRequestStatus,
} from '../controllers/learnController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createLearnRequestSchema,
  createResponseSchema,
  updateLearnRequestStatusSchema,
} from '../validations/learnValidation.js';
import { upload } from '../utils/upload.js';

const router = Router();

router.get('/', optionalAuth, getLearnRequests);
router.get('/:id', optionalAuth, getLearnRequest);
router.post('/', authenticate, upload.single('image'), validateRequest(createLearnRequestSchema), createLearnRequest);
router.post('/:id/responses', authenticate, validateRequest(createResponseSchema), createResponse);
router.put('/:id/status', authenticate, validateRequest(updateLearnRequestStatusSchema), updateLearnRequestStatus);

export default router;
