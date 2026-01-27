import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadToCloudinary } from '../utils/upload.js';

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId || req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId! },
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
        gender: true,
        lookingFor: true,
        interests: true,
        photos: true,
        selfie: true,
        latitude: true,
        longitude: true,
        isVerified: true,
        spotifyConnected: true,
        spotifyLastTrack: true,
        createdAt: true,
 // Exclude password
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

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      firstName, 
      lastName, 
      displayName, 
      bio, 
      dateOfBirth, 
      latitude, 
      longitude,
      gender,
      lookingFor,
      interests,
      photos,
      selfie,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(gender !== undefined && { gender }),
        ...(lookingFor !== undefined && { lookingFor: Array.isArray(lookingFor) ? lookingFor : [] }),
        ...(interests !== undefined && { interests: Array.isArray(interests) ? interests : [] }),
        ...(photos !== undefined && { photos: Array.isArray(photos) ? photos : [] }),
        ...(selfie !== undefined && { selfie }),
      },
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
        gender: true,
        lookingFor: true,
        interests: true,
        photos: true,
        selfie: true,
        latitude: true,
        longitude: true,
        isVerified: true,
        spotifyConnected: true,
        spotifyLastTrack: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const imageUrl = await uploadToCloudinary(req.file);

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: { avatar: imageUrl },
      select: {
        id: true,
        avatar: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId || req.userId;

    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    // Get connections count (ACCEPTED matches)
    const connectionsCount = await prisma.match.count({
      where: {
        OR: [
          { senderId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    // Get meetups count (created + joined)
    const createdMeetupsCount = await prisma.meetup.count({
      where: { creatorId: userId },
    });

    const joinedMeetupsCount = await prisma.meetupMember.count({
      where: {
        userId: userId,
        status: { in: ['going', 'interested'] },
      },
    });

    const totalMeetupsCount = createdMeetupsCount + joinedMeetupsCount;

    // Get badges count
    const badgesCount = await prisma.userBadge.count({
      where: { userId: userId },
    });

    res.json({
      success: true,
      data: {
        connections: connectionsCount,
        meetups: totalMeetupsCount,
        badges: badgesCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query, limit = 20, offset = 0 } = req.query;

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: req.userId } },
          { status: 'ACTIVE' },
          query
            ? {
                OR: [
                  { firstName: { contains: query as string, mode: 'insensitive' } },
                  { lastName: { contains: query as string, mode: 'insensitive' } },
                  { displayName: { contains: query as string, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatar: true,
        bio: true,
      },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
