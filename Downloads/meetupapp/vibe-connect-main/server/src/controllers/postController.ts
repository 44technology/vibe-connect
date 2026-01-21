import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadToCloudinary } from '../utils/upload.js';

export const createPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Multer parses multipart/form-data, so body fields are already parsed
    // But we need to handle both JSON and FormData
    let content, venueId, meetupId;
    
    if (req.body && typeof req.body === 'object') {
      // If body is already parsed (from multer or express.json)
      content = req.body.content;
      venueId = req.body.venueId;
      meetupId = req.body.meetupId;
    } else if (typeof req.body === 'string') {
      // If body is a string, try to parse it
      try {
        const parsed = JSON.parse(req.body);
        content = parsed.content;
        venueId = parsed.venueId;
        meetupId = parsed.meetupId;
      } catch {
        // If parsing fails, use empty values
        content = venueId = meetupId = undefined;
      }
    }

    // Validate that either content or image is provided
    if (!content && !req.file) {
      throw new AppError('Post must have content or image', 400);
    }

    // Check if user is authenticated
    if (!req.userId) {
      throw new AppError('Authentication required', 401);
    }

    let imageUrl = null;
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file);
      } catch (uploadError: any) {
        console.error('Cloudinary upload error:', uploadError);
        throw new AppError('Failed to upload image: ' + (uploadError.message || 'Unknown error'), 500);
      }
    }

    // Validate venueId and meetupId if provided
    if (venueId) {
      const venue = await prisma.venue.findUnique({ where: { id: venueId } });
      if (!venue) {
        throw new AppError('Venue not found', 404);
      }
    }

    if (meetupId) {
      const meetup = await prisma.meetup.findUnique({ where: { id: meetupId } });
      if (!meetup) {
        throw new AppError('Meetup not found', 404);
      }
    }

    const post = await prisma.post.create({
      data: {
        userId: req.userId,
        content: content || null,
        image: imageUrl,
        venueId: venueId || null,
        meetupId: meetupId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        venue: true,
        meetup: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error('Create post error:', error);
    next(error);
  }
};

export const getPosts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { venueId, meetupId, limit = 20, offset = 0 } = req.query;

    const posts = await prisma.post.findMany({
      where: {
        ...(venueId && { venueId: venueId as string }),
        ...(meetupId && { meetupId: meetupId as string }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        venue: true,
        meetup: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

export const likePost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: req.userId!,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.postLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      return res.json({
        success: true,
        message: 'Post unliked',
        liked: false,
      });
    }

    // Like
    await prisma.postLike.create({
      data: {
        postId: id,
        userId: req.userId!,
      },
    });

    res.json({
      success: true,
      message: 'Post liked',
      liked: true,
    });
  } catch (error) {
    next(error);
  }
};

export const commentPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new AppError('Comment content is required', 400);
    }

    const comment = await prisma.postComment.create({
      data: {
        postId: id,
        userId: req.userId!,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

export const getPostComments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const comments = await prisma.postComment.findMany({
      where: {
        postId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};
