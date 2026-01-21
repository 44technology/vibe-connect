import { Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

export const getClassSuggestions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skill, category } = req.query;

    if (!skill) {
      throw new AppError('Skill parameter is required', 400);
    }

    const skillLower = (skill as string).toLowerCase();

    // Find similar skills from existing classes
    const existingClasses = await prisma.class.findMany({
      where: {
        OR: [
          { skill: { contains: skillLower, mode: 'insensitive' } },
          { category: { contains: skillLower, mode: 'insensitive' } },
        ],
        status: {
          in: ['UPCOMING', 'ONGOING'],
        },
      },
      select: {
        skill: true,
        category: true,
      },
      take: 20,
    });

    // Extract unique skills and categories
    const suggestedSkills = new Set<string>();
    const suggestedCategories = new Set<string>();

    existingClasses.forEach((c) => {
      if (c.skill) suggestedSkills.add(c.skill);
      if (c.category) suggestedCategories.add(c.category);
    });

    // Find venues that might offer this skill
    const relevantVenues = await prisma.venue.findMany({
      where: {
        OR: [
          { name: { contains: skillLower, mode: 'insensitive' } },
          { description: { contains: skillLower, mode: 'insensitive' } },
          { amenities: { has: skillLower } },
        ],
      },
      include: {
        classes: {
          where: {
            status: {
              in: ['UPCOMING', 'ONGOING'],
            },
          },
          select: {
            skill: true,
            category: true,
          },
          take: 5,
        },
        _count: {
          select: {
            classes: true,
          },
        },
      },
      take: 10,
    });

    // Find venues that have classes in similar categories
    const categoryVenues = category
      ? await prisma.venue.findMany({
          where: {
            classes: {
              some: {
                category: { contains: category as string, mode: 'insensitive' },
                status: {
                  in: ['UPCOMING', 'ONGOING'],
                },
              },
            },
          },
          include: {
            _count: {
              select: {
                classes: true,
              },
            },
          },
          take: 5,
        })
      : [];

    res.json({
      success: true,
      data: {
        searchedSkill: skill,
        suggestedSkills: Array.from(suggestedSkills).slice(0, 5),
        suggestedCategories: Array.from(suggestedCategories).slice(0, 5),
        relevantVenues: relevantVenues.map((v) => ({
          id: v.id,
          name: v.name,
          description: v.description,
          address: v.address,
          city: v.city,
          image: v.image,
          classCount: v._count.classes,
          offeredSkills: Array.from(
            new Set(v.classes.map((c) => c.skill).filter(Boolean))
          ),
        })),
        categoryVenues: categoryVenues.map((v) => ({
          id: v.id,
          name: v.name,
          description: v.description,
          address: v.address,
          city: v.city,
          image: v.image,
          classCount: v._count.classes,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const requestClassSuggestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skill, category, message, preferredVenueId } = req.body;

    if (!skill) {
      throw new AppError('Skill is required', 400);
    }

    // In a real app, you might want to store these suggestions in a database
    // For now, we'll just return a success message
    // You could create a Suggestion model to track user requests

    // Find venues that might be interested
    const potentialVenues = preferredVenueId
      ? await prisma.venue.findMany({
          where: {
            OR: [
              { id: preferredVenueId },
              {
                amenities: {
                  hasSome: [skill.toLowerCase()],
                },
              },
            ],
          },
          take: 5,
        })
      : await prisma.venue.findMany({
          where: {
            OR: [
              { description: { contains: skill, mode: 'insensitive' } },
              { amenities: { hasSome: [skill.toLowerCase()] } },
            ],
          },
          take: 5,
        });

    res.json({
      success: true,
      message: 'Suggestion submitted successfully',
      data: {
        skill,
        category,
        message,
        potentialVenues: potentialVenues.map((v) => ({
          id: v.id,
          name: v.name,
          city: v.city,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
