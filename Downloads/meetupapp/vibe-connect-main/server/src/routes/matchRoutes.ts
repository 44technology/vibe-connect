import { Router } from 'express';
import {
  createMatch,
  updateMatch,
  getMatches,
  getMatch,
} from '../controllers/matchController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createMatchSchema,
  updateMatchSchema,
} from '../validations/matchValidation.js';

const router = Router();

router.get('/', authenticate, getMatches);
router.get('/:id', authenticate, getMatch);
router.post('/', authenticate, validateRequest(createMatchSchema), createMatch);
router.put('/:id', authenticate, validateRequest(updateMatchSchema), updateMatch);

export default router;
