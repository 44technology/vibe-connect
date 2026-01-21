import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateToken } from '../utils/jwt.js';

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expiresAt: Date }>();

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      throw new AppError('Phone number is required', 400);
    }

    // Format phone number
    const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    // Store OTP
    otpStore.set(formattedPhone, { code, expiresAt });

    // TODO: Send OTP via SMS service (Twilio, AWS SNS, etc.)
    // For now, log it (in production, send via SMS)
    console.log(`OTP for ${formattedPhone}: ${code}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp: code }),
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone, code, firstName, lastName, displayName } = req.body;

    if (!phone || !code) {
      throw new AppError('Phone number and OTP code are required', 400);
    }

    // Format phone number
    const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;

    // Test OTP codes (for development/testing - works in all environments)
    const TEST_OTP_CODES = ['123456', '000000', '111111', '999999'];
    const isTestCode = TEST_OTP_CODES.includes(code);

    // Get stored OTP
    const stored = otpStore.get(formattedPhone);

    // If using test code, skip OTP verification
    if (!isTestCode) {
      if (!stored) {
        throw new AppError('OTP not found or expired', 400);
      }

      if (new Date() > stored.expiresAt) {
        otpStore.delete(formattedPhone);
        throw new AppError('OTP expired', 400);
      }

      if (stored.code !== code) {
        throw new AppError('Invalid OTP code', 400);
      }
    } else {
      // Log test code usage
      console.log(`⚠️  TEST OTP CODE USED for ${formattedPhone}: ${code}`);
    }

    // OTP verified - remove from store
    otpStore.delete(formattedPhone);

    // Find existing user
    let user = await prisma.user.findUnique({
      where: { phone: formattedPhone },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatar: true,
      },
    });

    // If user exists, just verify and return token
    if (user) {
      // Update last seen
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          lastSeen: new Date(),
          ...(firstName && lastName && {
            firstName,
            lastName,
            displayName: displayName || `${firstName} ${lastName}`,
          }),
        },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          displayName: true,
          avatar: true,
        },
      });

      const token = generateToken(user.id);
      return res.json({
        success: true,
        data: {
          user,
          token,
        },
      });
    }

    // If user doesn't exist and we have firstName/lastName, create user
    if (firstName && lastName) {
      user = await prisma.user.create({
        data: {
          phone: formattedPhone,
          firstName,
          lastName,
          displayName: displayName || `${firstName} ${lastName}`,
          authProvider: 'PHONE',
          isVerified: true,
        },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          displayName: true,
          avatar: true,
        },
      });

      const token = generateToken(user.id);
      return res.json({
        success: true,
        data: {
          user,
          token,
        },
      });
    }

    // If user doesn't exist and we don't have firstName/lastName, just return success
    // Frontend will collect user info and call register later
    res.json({
      success: true,
      message: 'OTP verified successfully. Please complete your profile.',
      verified: true,
    });
  } catch (error) {
    next(error);
  }
};
