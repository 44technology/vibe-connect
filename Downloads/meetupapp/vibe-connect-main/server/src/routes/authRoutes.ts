import { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  appleAuth,
  getMe,
} from '../controllers/authController.js';
import { sendOTP, verifyOTP } from '../controllers/otpController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  registerSchema,
  loginSchema,
} from '../validations/userValidation.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/google', googleAuth);
router.post('/apple', appleAuth);
router.post('/otp/send', sendOTP);
router.post('/otp/verify', verifyOTP);
router.get('/me', authenticate, getMe);

export default router;
