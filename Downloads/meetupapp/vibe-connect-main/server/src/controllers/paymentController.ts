import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { 
  calculatePaymentBreakdown, 
  generatePaymentNumber, 
  generatePayoutNumber,
  PaymentCalculation 
} from '../services/paymentService.js';
import { AuthRequest } from '../middleware/auth.js';

/**
 * Create payment for class enrollment or meetup join
 * POST /api/payments
 */
export const createPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { 
      grossAmount, 
      classId, 
      meetupId, 
      enrollmentId,
      ticketId,
      paymentMethod,
      stripePaymentId,
      cardLast4 
    } = req.body;

    if (!grossAmount || grossAmount <= 0) {
      throw new AppError('Invalid payment amount', 400);
    }

    if (!classId && !meetupId) {
      throw new AppError('Either classId or meetupId is required', 400);
    }

    // Calculate payment breakdown
    const breakdown = calculatePaymentBreakdown(grossAmount);

    // Determine recipient (venue or instructor)
    let recipientType: 'venue' | 'instructor' = 'instructor';
    let recipientId: string = '';

    if (classId) {
      const classItem = await prisma.class.findUnique({
        where: { id: classId },
        include: { venue: true },
      });

      if (!classItem) {
        throw new AppError('Class not found', 404);
      }

      // For classes, recipient is the venue (venue gets the payout)
      recipientType = 'venue';
      recipientId = classItem.venueId;
    } else if (meetupId) {
      const meetup = await prisma.meetup.findUnique({
        where: { id: meetupId },
        include: { venue: true },
      });

      if (!meetup) {
        throw new AppError('Meetup not found', 404);
      }

      // For meetups, recipient is the venue if exists, otherwise creator
      if (meetup.venueId) {
        recipientType = 'venue';
        recipientId = meetup.venueId;
      } else {
        recipientType = 'instructor';
        recipientId = meetup.creatorId;
      }
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        paymentNumber: generatePaymentNumber(),
        userId,
        grossAmount: breakdown.grossAmount,
        stripeFee: breakdown.stripeFee,
        netAmount: breakdown.netAmount,
        platformFee: breakdown.platformFee,
        payoutAmount: breakdown.payoutAmount,
        paymentMethod: paymentMethod || 'card',
        paymentProvider: 'stripe',
        stripePaymentId,
        cardLast4,
        status: 'COMPLETED',
        paidAt: new Date(),
        classId: classId || null,
        meetupId: meetupId || null,
        enrollmentId: enrollmentId || null,
        ticketId: ticketId || null,
      },
    });

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        payoutNumber: generatePayoutNumber(),
        recipientType,
        recipientId,
        totalAmount: breakdown.payoutAmount,
        currency: 'USD',
        payoutMethod: 'stripe_connect', // Default, can be updated
        status: 'PENDING',
        paymentId: payment.id,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        payment: {
          ...payment,
          breakdown,
        },
        payout: {
          id: payout.id,
          payoutNumber: payout.payoutNumber,
          recipientType,
          recipientId,
          amount: breakdown.payoutAmount,
          status: payout.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment details
 * GET /api/payments/:id
 */
export const getPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const payment = await prisma.payment.findUnique({
      where: { id },
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
        class: {
          select: {
            id: true,
            title: true,
            venue: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        meetup: {
          select: {
            id: true,
            title: true,
            venue: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payout: true,
      },
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Only allow user to see their own payments (unless admin)
    if (payment.userId !== userId && req.user?.role !== 'admin') {
      throw new AppError('Unauthorized', 403);
    }

    const breakdown = {
      grossAmount: payment.grossAmount,
      stripeFee: payment.stripeFee,
      netAmount: payment.netAmount,
      platformFee: payment.platformFee,
      payoutAmount: payment.payoutAmount,
    };

    res.json({
      success: true,
      data: {
        ...payment,
        breakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's payments
 * GET /api/payments
 */
export const getUserPayments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        class: {
          select: {
            id: true,
            title: true,
            image: true,
          },
        },
        meetup: {
          select: {
            id: true,
            title: true,
            image: true,
          },
        },
        payout: {
          select: {
            id: true,
            payoutNumber: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get platform revenue (admin only)
 * GET /api/payments/revenue
 */
export const getPlatformRevenue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Add admin check middleware
    // if (req.user?.role !== 'admin') {
    //   throw new AppError('Unauthorized', 403);
    // }

    const { startDate, endDate } = req.query;

    const where: any = {
      status: 'COMPLETED',
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      select: {
        grossAmount: true,
        stripeFee: true,
        netAmount: true,
        platformFee: true,
        payoutAmount: true,
        createdAt: true,
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.platformFee, 0);
    const totalStripeFees = payments.reduce((sum, p) => sum + p.stripeFee, 0);
    const totalPayouts = payments.reduce((sum, p) => sum + p.payoutAmount, 0);
    const totalGross = payments.reduce((sum, p) => sum + p.grossAmount, 0);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalStripeFees,
        totalPayouts,
        totalGross,
        paymentCount: payments.length,
        breakdown: payments,
      },
    });
  } catch (error) {
    next(error);
  }
};
