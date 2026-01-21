import { Router } from 'express';
import {
  getClassSuggestions,
  requestClassSuggestion,
} from '../controllers/suggestionController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validateQuery.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  getClassSuggestionsSchema,
  requestClassSuggestionSchema,
} from '../validations/suggestionValidation.js';

const router = Router();

router.get('/classes', optionalAuth, validateQuery(getClassSuggestionsSchema), getClassSuggestions);
router.post('/classes/request', authenticate, validateRequest(requestClassSuggestionSchema), requestClassSuggestion);

export default router;
