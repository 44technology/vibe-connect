import { Router } from 'express';
import {
  createVenue,
  getVenue,
  updateVenue,
  deleteVenue,
  getVenues,
  getNearbyVenues,
} from '../controllers/venueController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { validateQuery } from '../middleware/validateQuery.js';
import {
  createVenueSchema,
  updateVenueSchema,
  nearbyVenuesSchema,
} from '../validations/venueValidation.js';
import { upload } from '../utils/upload.js';

const router = Router();

router.get('/nearby', optionalAuth, validateQuery(nearbyVenuesSchema), getNearbyVenues);
router.get('/', optionalAuth, getVenues);
router.get('/:id', optionalAuth, getVenue);
router.post('/', authenticate, upload.single('image'), validateRequest(createVenueSchema), createVenue);
router.put('/:id', authenticate, upload.single('image'), validateRequest(updateVenueSchema), updateVenue);
router.delete('/:id', authenticate, deleteVenue);

export default router;
