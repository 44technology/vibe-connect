import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadToCloudinary } from '../utils/upload.js';
import { getBoundingBox, calculateDistance } from '../utils/geolocation.js';

export const createVenue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      country,
      zipCode,
      latitude,
      longitude,
      website,
      phone,
      capacity,
      amenities,
    } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    const venue = await prisma.venue.create({
      data: {
        name,
        description,
        address,
        city,
        state,
        country,
        zipCode,
        latitude,
        longitude,
        image: imageUrl,
        website,
        phone,
        capacity,
        amenities: amenities || [],
      },
    });

    res.status(201).json({
      success: true,
      data: venue,
    });
  } catch (error) {
    next(error);
  }
};

export const getVenue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            meetups: true,
          },
        },
      },
    });

    if (!venue) {
      throw new AppError('Venue not found', 404);
    }

    res.json({
      success: true,
      data: venue,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVenue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const venue = await prisma.venue.findUnique({
      where: { id },
    });

    if (!venue) {
      throw new AppError('Venue not found', 404);
    }

    const {
      name,
      description,
      address,
      city,
      state,
      country,
      zipCode,
      latitude,
      longitude,
      website,
      phone,
      capacity,
      amenities,
    } = req.body;

    let imageUrl = venue.image;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    const updatedVenue = await prisma.venue.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state !== undefined && { state }),
        ...(country && { country }),
        ...(zipCode !== undefined && { zipCode }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(imageUrl && { image: imageUrl }),
        ...(website !== undefined && { website }),
        ...(phone !== undefined && { phone }),
        ...(capacity !== undefined && { capacity }),
        ...(amenities && { amenities }),
      },
    });

    res.json({
      success: true,
      data: updatedVenue,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVenue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const venue = await prisma.venue.findUnique({
      where: { id },
    });

    if (!venue) {
      throw new AppError('Venue not found', 404);
    }

    await prisma.venue.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Venue deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getVenues = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      city, 
      search,
      latitude,
      longitude,
      radius,
      limit = 20, 
      offset = 0 
    } = req.query;

    const where: any = {};

    if (city) {
      where.city = city as string;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
        { city: { contains: search as string, mode: 'insensitive' } },
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

    const venues = await prisma.venue.findMany({
      where,
      include: {
        _count: {
          select: {
            meetups: true,
          },
        },
      },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json({
      success: true,
      data: venues,
    });
  } catch (error) {
    next(error);
  }
};

export const getNearbyVenues = async (
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

    const venues = await prisma.venue.findMany({
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
        ],
      },
      include: {
        _count: {
          select: {
            meetups: true,
          },
        },
      },
      take: Number(limit),
    });

    // Calculate distances and sort
    const venuesWithDistance = venues
      .map((venue) => {
        const distance = calculateDistance(
          lat,
          lon,
          venue.latitude,
          venue.longitude
        );
        return { ...venue, distance };
      })
      .filter((v) => v.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      data: venuesWithDistance,
    });
  } catch (error) {
    next(error);
  }
};
