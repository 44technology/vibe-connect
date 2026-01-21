import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadToCloudinary } from '../utils/upload.js';
import { getBoundingBox, calculateDistance } from '../utils/geolocation.js';

export const createMeetup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      maxAttendees,
      category,
      tags,
      venueId,
      latitude,
      longitude,
      location,
      isPublic,
      isFree,
      pricePerPerson,
      isBlindMeet,
    } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    const meetup = await prisma.meetup.create({
      data: {
        title,
        description,
        image: imageUrl,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        maxAttendees,
        category,
        tags: tags || [],
        creatorId: req.userId!,
        venueId: venueId || null,
        latitude: latitude || null,
        longitude: longitude || null,
        location: location || null,
        isPublic: isPublic !== undefined ? isPublic : true,
        isFree: isFree !== undefined ? isFree : true,
        pricePerPerson: pricePerPerson || null,
        isBlindMeet: isBlindMeet || false,
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
        venue: true,
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
      data: meetup,
    });
  } catch (error) {
    next(error);
  }
};

export const getMeetup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const meetup = await prisma.meetup.findUnique({
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
        venue: true,
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

    if (!meetup) {
      throw new AppError('Meetup not found', 404);
    }

    res.json({
      success: true,
      data: meetup,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMeetup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const meetup = await prisma.meetup.findUnique({
      where: { id },
    });

    if (!meetup) {
      throw new AppError('Meetup not found', 404);
    }

    if (meetup.creatorId !== req.userId) {
      throw new AppError('Not authorized to update this meetup', 403);
    }

    const {
      title,
      description,
      startTime,
      endTime,
      maxAttendees,
      category,
      tags,
      venueId,
      latitude,
      longitude,
      location,
      isPublic,
      isFree,
      pricePerPerson,
      isBlindMeet,
      status,
    } = req.body;

    let imageUrl = meetup.image;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    const updatedMeetup = await prisma.meetup.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(imageUrl && { image: imageUrl }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(maxAttendees !== undefined && { maxAttendees }),
        ...(category !== undefined && { category }),
        ...(tags && { tags }),
        ...(venueId !== undefined && { venueId }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(location !== undefined && { location }),
        ...(isPublic !== undefined && { isPublic }),
        ...(isFree !== undefined && { isFree }),
        ...(pricePerPerson !== undefined && { pricePerPerson }),
        ...(isBlindMeet !== undefined && { isBlindMeet }),
        ...(status && { status }),
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
        venue: true,
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

    res.json({
      success: true,
      data: updatedMeetup,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMeetup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const meetup = await prisma.meetup.findUnique({
      where: { id },
    });

    if (!meetup) {
      throw new AppError('Meetup not found', 404);
    }

    if (meetup.creatorId !== req.userId) {
      throw new AppError('Not authorized to delete this meetup', 403);
    }

    await prisma.meetup.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Meetup deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMeetups = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      category, 
      status, 
      search,
      isFree,
      isPublic,
      priceMin,
      priceMax,
      latitude,
      longitude,
      radius,
      limit = 20, 
      offset = 0 
    } = req.query;

    const where: any = {};

    if (category) {
      where.category = category as string;
    }

    if (status) {
      where.status = status as any;
    }

    if (isFree !== undefined) {
      where.isFree = isFree === 'true';
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }

    if (priceMin || priceMax) {
      where.pricePerPerson = {};
      if (priceMin) where.pricePerPerson.gte = Number(priceMin);
      if (priceMax) where.pricePerPerson.lte = Number(priceMax);
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } },
        { tags: { has: search as string } },
      ];
    }

    // Location-based filtering
    if (latitude && longitude && radius) {
      const lat = Number(latitude);
      const lon = Number(longitude);
      const radiusKm = Number(radius);

      if (!isNaN(lat) && !isNaN(lon) && !isNaN(radiusKm)) {
        const bbox = getBoundingBox(lat, lon, radiusKm);
        where.latitude = { gte: bbox.minLat, lte: bbox.maxLat };
        where.longitude = { gte: bbox.minLon, lte: bbox.maxLon };
      }
    }

    const meetups = await prisma.meetup.findMany({
      where,
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
        venue: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json({
      success: true,
      data: meetups,
    });
  } catch (error) {
    next(error);
  }
};

export const getNearbyMeetups = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { latitude, longitude, radius = 10, limit = 20 } = req.query;

    const lat = Number(latitude);
    const lon = Number(longitude);
    const radiusKm = Number(radius);

    if (!lat || !lon) {
      throw new AppError('Latitude and longitude are required', 400);
    }

    const bbox = getBoundingBox(lat, lon, radiusKm);

    const meetups = await prisma.meetup.findMany({
      where: {
        AND: [
          {
            latitude: {
              gte: bbox.minLat,
              lte: bbox.maxLat,
            },
          },
          {
            longitude: {
              gte: bbox.minLon,
              lte: bbox.maxLon,
            },
          },
          {
            status: {
              in: ['UPCOMING', 'ONGOING'],
            },
          },
        ],
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
        venue: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
      take: Number(limit),
    });

    // Calculate distances and sort
    const meetupsWithDistance = meetups
      .map((meetup) => {
        if (!meetup.latitude || !meetup.longitude) return null;
        const distance = calculateDistance(
          lat,
          lon,
          meetup.latitude,
          meetup.longitude
        );
        return { ...meetup, distance };
      })
      .filter((m) => m !== null && m.distance <= radiusKm)
      .sort((a, b) => a!.distance - b!.distance);

    res.json({
      success: true,
      data: meetupsWithDistance,
    });
  } catch (error) {
    next(error);
  }
};

export const joinMeetup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status = 'going' } = req.body;

    const meetup = await prisma.meetup.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!meetup) {
      throw new AppError('Meetup not found', 404);
    }

    // Check if already a member
    const existingMember = meetup.members.find(
      (m) => m.userId === req.userId
    );

    if (existingMember) {
      // Update status
      const updated = await prisma.meetupMember.update({
        where: { id: existingMember.id },
        data: { status },
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

      return res.json({
        success: true,
        data: updated,
      });
    }

    // Check max attendees
    if (meetup.maxAttendees && meetup.members.length >= meetup.maxAttendees) {
      throw new AppError('Meetup is full', 400);
    }

    const member = await prisma.meetupMember.create({
      data: {
        meetupId: id,
        userId: req.userId!,
        status,
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
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const leaveMeetup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const member = await prisma.meetupMember.findFirst({
      where: {
        meetupId: id,
        userId: req.userId!,
      },
    });

    if (!member) {
      throw new AppError('Not a member of this meetup', 404);
    }

    await prisma.meetupMember.delete({
      where: { id: member.id },
    });

    res.json({
      success: true,
      message: 'Left meetup successfully',
    });
  } catch (error) {
    next(error);
  }
};
