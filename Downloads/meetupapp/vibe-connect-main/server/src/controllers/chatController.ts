import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadToCloudinary } from '../utils/upload.js';

export const getChats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId: req.userId!,
          },
        },
      },
      include: {
        members: {
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
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: chats,
    });
  } catch (error) {
    next(error);
  }
};

export const getChat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const chat = await prisma.chat.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: req.userId!,
          },
        },
      },
      include: {
        members: {
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
        },
        messages: {
          include: {
            sender: {
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
          take: 50,
        },
        meetup: {
          select: {
            id: true,
            title: true,
            image: true,
          },
        },
      },
    });

    if (!chat) {
      throw new AppError('Chat not found', 404);
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        chatId: id,
        senderId: { not: req.userId! },
        read: false,
      },
      data: {
        read: true,
      },
    });

    // Update last read time
    await prisma.chatMember.updateMany({
      where: {
        chatId: id,
        userId: req.userId!,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
};

export const createDirectChat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;

    if (userId === req.userId) {
      throw new AppError('Cannot create chat with yourself', 400);
    }

    // Check if chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        type: 'direct',
        members: {
          every: {
            userId: {
              in: [req.userId!, userId],
            },
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (existingChat && existingChat.members.length === 2) {
      return res.json({
        success: true,
        data: existingChat,
      });
    }

    const chat = await prisma.chat.create({
      data: {
        type: 'direct',
        members: {
          create: [
            { userId: req.userId! },
            { userId },
          ],
        },
      },
      include: {
        members: {
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
        },
      },
    });

    res.status(201).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
};

export const createGroupChat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, userIds, meetupId } = req.body;

    if (!userIds || userIds.length === 0) {
      throw new AppError('At least one user is required', 400);
    }

    // Include current user
    const allUserIds = [...new Set([req.userId!, ...userIds])];

    const chat = await prisma.chat.create({
      data: {
        name,
        type: 'group',
        meetupId: meetupId || null,
        members: {
          create: allUserIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        members: {
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
        },
        meetup: meetupId
          ? {
              select: {
                id: true,
                title: true,
                image: true,
              },
            }
          : false,
      },
    });

    res.status(201).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Verify user is a member of the chat
    const chatMember = await prisma.chatMember.findFirst({
      where: {
        chatId: id,
        userId: req.userId!,
      },
    });

    if (!chatMember) {
      throw new AppError('Not a member of this chat', 403);
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    const message = await prisma.message.create({
      data: {
        chatId: id,
        senderId: req.userId!,
        content,
        image: imageUrl,
      },
      include: {
        sender: {
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

    // Update chat updatedAt
    await prisma.chat.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify user is a member
    const chatMember = await prisma.chatMember.findFirst({
      where: {
        chatId: id,
        userId: req.userId!,
      },
    });

    if (!chatMember) {
      throw new AppError('Not a member of this chat', 403);
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId: id,
      },
      include: {
        sender: {
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
        createdAt: 'desc',
      },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json({
      success: true,
      data: messages.reverse(),
    });
  } catch (error) {
    next(error);
  }
};
