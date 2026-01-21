import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadToCloudinary } from '../utils/upload.js';

export const createLearnRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, skill, category, latitude, longitude } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    const learnRequest = await prisma.learnRequest.create({
      data: {
        title,
        description,
        skill,
        category: category || null,
        image: imageUrl,
        creatorId: req.userId!,
        latitude: latitude || null,
        longitude: longitude || null,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        responses: {
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
            venue: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: learnRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const getLearnRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skill, category, status, limit = 20, offset = 0 } = req.query;

    const learnRequests = await prisma.learnRequest.findMany({
      where: {
        ...(skill && { skill: { contains: skill as string, mode: 'insensitive' } }),
        ...(category && { category: category as string }),
        ...(status && { status: status as any }),
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            responses: true,
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
      data: learnRequests,
    });
  } catch (error) {
    next(error);
  }
};

export const getLearnRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const learnRequest = await prisma.learnRequest.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        responses: {
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
            venue: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!learnRequest) {
      throw new AppError('Learn request not found', 404);
    }

    res.json({
      success: true,
      data: learnRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const createResponse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { message, price, availability, responseType, venueId } = req.body;

    // Verify learn request exists
    const learnRequest = await prisma.learnRequest.findUnique({
      where: { id },
    });

    if (!learnRequest) {
      throw new AppError('Learn request not found', 404);
    }

    if (learnRequest.status !== 'OPEN') {
      throw new AppError('Learn request is not open for responses', 400);
    }

    // Validate response type
    if (responseType === 'VENUE' && !venueId) {
      throw new AppError('Venue ID is required for venue responses', 400);
    }

    if (responseType === 'USER' && !req.userId) {
      throw new AppError('User authentication required', 401);
    }

    const response = await prisma.learnResponse.create({
      data: {
        learnRequestId: id,
        responseType: responseType || 'USER',
        message,
        price: price ? parseFloat(price) : null,
        availability: availability || null,
        userId: responseType === 'USER' ? req.userId! : null,
        venueId: responseType === 'VENUE' ? venueId : null,
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
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            image: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLearnRequestStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const learnRequest = await prisma.learnRequest.findUnique({
      where: { id },
    });

    if (!learnRequest) {
      throw new AppError('Learn request not found', 404);
    }

    if (learnRequest.creatorId !== req.userId) {
      throw new AppError('Not authorized to update this learn request', 403);
    }

    const updated = await prisma.learnRequest.update({
      where: { id },
      data: { status },
      include: {
        creator: {
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

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
