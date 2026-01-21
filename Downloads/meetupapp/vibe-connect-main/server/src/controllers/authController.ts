import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, phone, password, firstName, lastName, displayName, dateOfBirth, authProvider, providerId } = req.body;

    // Validate that either email or phone is provided
    if (!email && !phone) {
      throw new AppError('Either email or phone is required', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ],
      },
    });

    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password && authProvider === 'EMAIL') {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        firstName,
        lastName,
        displayName: displayName || `${firstName} ${lastName}`,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        authProvider: authProvider || 'EMAIL',
        providerId: providerId || null,
        isVerified: authProvider === 'GOOGLE' || authProvider === 'APPLE',
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatar: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, phone, password } = req.body;

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ],
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    if (user.password && password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }
    } else if (password) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('Account is not active', 403);
    }

    // Update last seen
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date() },
    });

    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idToken, email, given_name, family_name, picture } = req.body;

    // If we have user info from access token, use it directly
    // Otherwise, verify the idToken
    let userEmail = email;
    let userGivenName = given_name;
    let userFamilyName = family_name;
    let userPicture = picture;
    let userSub = '';

    if (idToken && !email) {
      // Verify ID token (for proper OAuth flow)
      if (!process.env.GOOGLE_CLIENT_ID) {
        throw new AppError('Google Client ID is not configured', 500);
      }

      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new AppError('Invalid Google token', 401);
      }

      userEmail = payload.email;
      userGivenName = payload.given_name;
      userFamilyName = payload.family_name;
      userPicture = payload.picture;
      userSub = payload.sub || '';
    } else if (!email) {
      throw new AppError('Email or ID token is required', 400);
    } else {
      // Using access token flow - generate a sub from email
      userSub = `google_${email}`;
    }

    const finalEmail = userEmail;
    const finalGivenName = userGivenName;
    const finalFamilyName = userFamilyName;
    const finalPicture = userPicture;
    const finalSub = userSub || `google_${finalEmail}`;

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: finalEmail },
          { providerId: finalSub, authProvider: 'GOOGLE' },
        ],
      },
    });

    if (user) {
      // Update user info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: finalEmail,
          firstName: finalGivenName || user.firstName,
          lastName: finalFamilyName || user.lastName,
          avatar: finalPicture || user.avatar,
          providerId: finalSub,
          authProvider: 'GOOGLE',
          isVerified: true,
          lastSeen: new Date(),
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
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: finalEmail,
          firstName: finalGivenName || 'User',
          lastName: finalFamilyName || '',
          displayName: `${finalGivenName || 'User'} ${finalFamilyName || ''}`.trim(),
          avatar: finalPicture || null,
          authProvider: 'GOOGLE',
          providerId: finalSub,
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
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const appleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { identityToken, authorizationCode, user } = req.body;

    // Note: Apple Sign In requires more complex verification
    // This is a simplified version - in production, you should verify the identity token
    // using Apple's public keys and validate the authorization code

    if (!identityToken) {
      throw new AppError('Identity token is required', 400);
    }

    // For now, we'll extract email from the user object if provided
    // In production, decode and verify the JWT identity token
    const email = user?.email;
    const userId = user?.userId || authorizationCode;

    if (!email && !userId) {
      throw new AppError('Invalid Apple token', 401);
    }

    // Find or create user
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          { providerId: userId, authProvider: 'APPLE' },
        ],
      },
    });

    if (dbUser) {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          email: email || dbUser.email,
          providerId: userId,
          authProvider: 'APPLE',
          isVerified: true,
          lastSeen: new Date(),
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
    } else {
      dbUser = await prisma.user.create({
        data: {
          email: email || null,
          firstName: user?.firstName || 'User',
          lastName: user?.lastName || '',
          displayName: user?.fullName || 'User',
          authProvider: 'APPLE',
          providerId: userId,
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
    }

    const token = generateToken(dbUser.id);

    res.json({
      success: true,
      data: {
        user: dbUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatar: true,
        bio: true,
        dateOfBirth: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
