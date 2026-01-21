import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

export const createMatch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { receiverId } = req.body;

    if (receiverId === req.userId) {
      throw new AppError('Cannot match with yourself', 400);
    }

    // Check if match already exists
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          {
            senderId: req.userId!,
            receiverId,
          },
          {
            senderId: receiverId,
            receiverId: req.userId!,
          },
        ],
      },
    });

    if (existingMatch) {
      throw new AppError('Match already exists', 409);
    }

    const match = await prisma.match.create({
      data: {
        senderId: req.userId!,
        receiverId,
        status: 'PENDING',
      },
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
            bio: true,
          },
        },
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: match,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMatch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const match = await prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    if (match.receiverId !== req.userId) {
      throw new AppError('Not authorized to update this match', 403);
    }

    const updatedMatch = await prisma.match.update({
      where: { id },
      data: { status },
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
            bio: true,
          },
        },
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedMatch,
    });
  } catch (error) {
    next(error);
  }
};

export const getMatches = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.query;

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { senderId: req.userId! },
          { receiverId: req.userId! },
        ],
        ...(status && { status: status as any }),
      },
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
            bio: true,
          },
        },
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format to show the other user
    const formattedMatches = matches.map((match) => ({
      id: match.id,
      status: match.status,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
      user:
        match.senderId === req.userId ? match.receiver : match.sender,
      isSender: match.senderId === req.userId,
    }));

    res.json({
      success: true,
      data: formattedMatches,
    });
  } catch (error) {
    next(error);
  }
};

export const getMatch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
            bio: true,
          },
        },
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    if (match.senderId !== req.userId && match.receiverId !== req.userId) {
      throw new AppError('Not authorized to view this match', 403);
    }

    res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    next(error);
  }
};
