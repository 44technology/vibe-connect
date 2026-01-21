import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

interface SocketUser {
  userId: string;
  socketId: string;
}

const connectedUsers = new Map<string, string>(); // userId -> socketId

export const setupSocket = (httpServer: HttpServer) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.status !== 'ACTIVE') {
        return next(new Error('User not found or inactive'));
      }

      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    connectedUsers.set(userId, socket.id);

    console.log(`User ${userId} connected`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join all chat rooms the user is a member of
    socket.on('join-chats', async () => {
      try {
        const chats = await prisma.chatMember.findMany({
          where: { userId },
          select: { chatId: true },
        });

        chats.forEach((chat) => {
          socket.join(`chat:${chat.chatId}`);
        });
      } catch (error) {
        console.error('Error joining chats:', error);
      }
    });

    // Join a specific chat room
    socket.on('join-chat', async (chatId: string) => {
      try {
        const isMember = await prisma.chatMember.findFirst({
          where: {
            chatId,
            userId,
          },
        });

        if (isMember) {
          socket.join(`chat:${chatId}`);
          socket.emit('joined-chat', chatId);
        } else {
          socket.emit('error', 'Not a member of this chat');
        }
      } catch (error) {
        socket.emit('error', 'Failed to join chat');
      }
    });

    // Send message
    socket.on('send-message', async (data: { chatId: string; content: string; image?: string }) => {
      try {
        const { chatId, content, image } = data;

        // Verify user is a member
        const chatMember = await prisma.chatMember.findFirst({
          where: {
            chatId,
            userId,
          },
        });

        if (!chatMember) {
          socket.emit('error', 'Not a member of this chat');
          return;
        }

        // Create message
        const message = await prisma.message.create({
          data: {
            chatId,
            senderId: userId,
            content,
            image: image || null,
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

        // Update chat
        await prisma.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() },
        });

        // Emit to all members of the chat
        io.to(`chat:${chatId}`).emit('new-message', message);

        // Update read status for sender
        await prisma.message.updateMany({
          where: {
            chatId,
            senderId: userId,
            read: false,
          },
          data: {
            read: true,
          },
        });
      } catch (error) {
        socket.emit('error', 'Failed to send message');
        console.error('Error sending message:', error);
      }
    });

    // Mark messages as read
    socket.on('mark-read', async (chatId: string) => {
      try {
        await prisma.message.updateMany({
          where: {
            chatId,
            senderId: { not: userId },
            read: false,
          },
          data: {
            read: true,
          },
        });

        await prisma.chatMember.updateMany({
          where: {
            chatId,
            userId,
          },
          data: {
            lastReadAt: new Date(),
          },
        });

        // Notify other members
        socket.to(`chat:${chatId}`).emit('messages-read', { chatId, userId });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Typing indicator
    socket.on('typing', (data: { chatId: string; isTyping: boolean }) => {
      socket.to(`chat:${data.chatId}`).emit('user-typing', {
        userId,
        chatId: data.chatId,
        isTyping: data.isTyping,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};
