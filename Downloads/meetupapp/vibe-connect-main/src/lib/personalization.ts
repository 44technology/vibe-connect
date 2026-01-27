/**
 * Hyper-Personalization Service
 * Provides personalized recommendations based on:
 * - User behavior (meetups joined, categories liked, active times)
 * - Location (proximity-based)
 * - Time (morning/afternoon/evening)
 * - Interests (user's selected interests)
 * - Budget (venue price ranges)
 * - Contextual needs (meal time, coffee time, etc.)
 */

import { Meetup } from '@/hooks/useMeetups';

// Storage keys
const USER_BEHAVIOR_KEY = 'user_behavior';
const USER_PREFERENCES_KEY = 'user_preferences';

export interface UserBehavior {
  meetupsJoined: string[]; // Meetup IDs
  categoriesLiked: Record<string, number>; // Category -> count
  activeTimes: Record<string, number>; // Hour (0-23) -> count
  venuesVisited: string[]; // Venue IDs
  priceRangePreference?: string; // '$', '$$', '$$$', '$$$$'
  averageDistance?: number; // Average distance user travels (km)
  lastActiveTime?: string; // ISO timestamp
}

export interface UserPreferences {
  preferredCategories: string[];
  preferredTimeSlots: string[]; // 'morning', 'afternoon', 'evening', 'night'
  maxDistance: number; // km
  budgetRange: {
    min?: number;
    max?: number;
  };
  interests: string[];
}

// Helper functions
const getStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Get user behavior
export const getUserBehavior = (userId: string): UserBehavior => {
  return getStorage(`${USER_BEHAVIOR_KEY}_${userId}`, {
    meetupsJoined: [],
    categoriesLiked: {},
    activeTimes: {},
    venuesVisited: [],
  });
};

// Update user behavior
export const updateUserBehavior = (userId: string, updates: Partial<UserBehavior>): void => {
  const current = getUserBehavior(userId);
  const updated = { ...current, ...updates };
  setStorage(`${USER_BEHAVIOR_KEY}_${userId}`, updated);
};

// Track meetup join
export const trackMeetupJoin = (userId: string, meetup: Meetup): void => {
  const behavior = getUserBehavior(userId);
  
  // Add to joined meetups
  if (!behavior.meetupsJoined.includes(meetup.id)) {
    behavior.meetupsJoined.push(meetup.id);
  }
  
  // Update category preference
  if (meetup.category) {
    behavior.categoriesLiked[meetup.category] = (behavior.categoriesLiked[meetup.category] || 0) + 1;
  }
  
  // Update active time (hour of day)
  const hour = new Date().getHours();
  behavior.activeTimes[hour.toString()] = (behavior.activeTimes[hour.toString()] || 0) + 1;
  
  // Update venue visited
  if (meetup.venue?.id && !behavior.venuesVisited.includes(meetup.venue.id)) {
    behavior.venuesVisited.push(meetup.venue.id);
  }
  
  // Update last active time
  behavior.lastActiveTime = new Date().toISOString();
  
  updateUserBehavior(userId, behavior);
};

// Get user preferences
export const getUserPreferences = (userId: string): UserPreferences => {
  return getStorage(`${USER_PREFERENCES_KEY}_${userId}`, {
    preferredCategories: [],
    preferredTimeSlots: ['morning', 'afternoon', 'evening'],
    maxDistance: 25, // km
    budgetRange: {},
    interests: [],
  });
};

// Update user preferences
export const updateUserPreferences = (userId: string, preferences: Partial<UserPreferences>): void => {
  const current = getUserPreferences(userId);
  const updated = { ...current, ...preferences };
  setStorage(`${USER_PREFERENCES_KEY}_${userId}`, updated);
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get current time slot
export const getCurrentTimeSlot = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

// Get contextual recommendation type
export const getContextualRecommendation = (): {
  type: 'coffee' | 'meal' | 'activity' | 'nightlife' | 'general';
  message: string;
} => {
  const hour = new Date().getHours();
  const timeSlot = getCurrentTimeSlot();
  
  if (hour >= 7 && hour < 11) {
    return { type: 'coffee', message: 'Good morning! How about a coffee meetup?' };
  }
  if (hour >= 11 && hour < 14) {
    return { type: 'meal', message: 'Lunch time! Find a dining meetup' };
  }
  if (hour >= 14 && hour < 17) {
    return { type: 'activity', message: 'Afternoon activities await!' };
  }
  if (hour >= 17 && hour < 20) {
    return { type: 'meal', message: 'Dinner plans? Join a food meetup' };
  }
  if (hour >= 20 && hour < 24) {
    return { type: 'nightlife', message: 'Nightlife vibes!' };
  }
  return { type: 'general', message: 'Discover new experiences' };
};

// Personalize meetups based on multiple factors
export const personalizeMeetups = (
  meetups: Meetup[],
  userId: string,
  userLocation?: { latitude: number; longitude: number },
  userInterests?: string[]
): Meetup[] => {
  const behavior = getUserBehavior(userId);
  const preferences = getUserPreferences(userId);
  const currentTimeSlot = getCurrentTimeSlot();
  const contextual = getContextualRecommendation();
  
  // Score each meetup
  const scoredMeetups = meetups.map((meetup) => {
    let score = 0;
    
    // 1. Interest matching (high weight)
    if (userInterests && meetup.tags) {
      const matchingInterests = meetup.tags.filter((tag) =>
        userInterests.some((interest) => tag.toLowerCase().includes(interest.toLowerCase()))
      );
      score += matchingInterests.length * 10;
    }
    
    // 2. Category preference from behavior (high weight)
    if (meetup.category && behavior.categoriesLiked[meetup.category]) {
      score += behavior.categoriesLiked[meetup.category] * 8;
    }
    
    // 3. Location proximity (medium weight)
    if (userLocation && meetup.latitude && meetup.longitude) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        meetup.latitude,
        meetup.longitude
      );
      
      // Prefer closer meetups
      if (distance <= preferences.maxDistance) {
        score += (preferences.maxDistance - distance) * 2;
      } else {
        score -= (distance - preferences.maxDistance) * 0.5; // Penalty for far
      }
    }
    
    // 4. Time slot matching (medium weight)
    if (meetup.startTime) {
      const meetupHour = new Date(meetup.startTime).getHours();
      let meetupTimeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
      if (meetupHour >= 5 && meetupHour < 12) meetupTimeSlot = 'morning';
      else if (meetupHour >= 12 && meetupHour < 17) meetupTimeSlot = 'afternoon';
      else if (meetupHour >= 17 && meetupHour < 22) meetupTimeSlot = 'evening';
      else meetupTimeSlot = 'night';
      
      if (preferences.preferredTimeSlots.includes(meetupTimeSlot)) {
        score += 5;
      }
      
      // Contextual matching (bonus)
      if (contextual.type === 'coffee' && meetup.category?.toLowerCase().includes('coffee')) {
        score += 15;
      }
      if (contextual.type === 'meal' && meetup.category?.toLowerCase().includes('dining')) {
        score += 15;
      }
      if (contextual.type === 'nightlife' && meetup.category?.toLowerCase().includes('nightlife')) {
        score += 15;
      }
    }
    
    // 5. Budget preference (low weight)
    if (meetup.venue?.priceRange && preferences.budgetRange) {
      const priceMap: Record<string, number> = { $: 1, '$$': 2, '$$$': 3, '$$$$': 4 };
      const meetupPrice = priceMap[meetup.venue.priceRange] || 0;
      
      if (preferences.budgetRange.max && meetupPrice <= preferences.budgetRange.max) {
        score += 3;
      }
    }
    
    // 6. Avoid already joined meetups (negative weight)
    if (behavior.meetupsJoined.includes(meetup.id)) {
      score -= 20;
    }
    
    // 7. Prefer upcoming meetups
    if (meetup.status === 'UPCOMING') {
      score += 5;
    }
    
    // 8. Prefer meetups with available spots
    const currentAttendees = meetup._count?.members || meetup.members?.length || 0;
    const availableSpots = (meetup.maxAttendees || 10) - currentAttendees;
    if (availableSpots > 0) {
      score += Math.min(availableSpots, 5); // Max 5 bonus points
    }
    
    return { ...meetup, _personalizationScore: score };
  });
  
  // Sort by score (highest first)
  return scoredMeetups.sort((a, b) => {
    const scoreA = (a as any)._personalizationScore || 0;
    const scoreB = (b as any)._personalizationScore || 0;
    return scoreB - scoreA;
  });
};

// Get top personalized recommendations
export const getTopRecommendations = (
  meetups: Meetup[],
  userId: string,
  userLocation?: { latitude: number; longitude: number },
  userInterests?: string[],
  limit: number = 10
): Meetup[] => {
  const personalized = personalizeMeetups(meetups, userId, userLocation, userInterests);
  return personalized.slice(0, limit);
};

// Get category-based recommendations
export const getCategoryRecommendations = (
  meetups: Meetup[],
  userId: string,
  category: string
): Meetup[] => {
  const behavior = getUserBehavior(userId);
  const categoryMeetups = meetups.filter((m) => m.category === category);
  
  // Sort by user's preference for this category
  return categoryMeetups.sort((a, b) => {
    const scoreA = behavior.categoriesLiked[category] || 0;
    const scoreB = behavior.categoriesLiked[category] || 0;
    return scoreB - scoreA;
  });
};

// Get time-based recommendations
export const getTimeBasedRecommendations = (
  meetups: Meetup[],
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night'
): Meetup[] => {
  return meetups.filter((meetup) => {
    if (!meetup.startTime) return false;
    const hour = new Date(meetup.startTime).getHours();
    
    if (timeSlot === 'morning') return hour >= 5 && hour < 12;
    if (timeSlot === 'afternoon') return hour >= 12 && hour < 17;
    if (timeSlot === 'evening') return hour >= 17 && hour < 22;
    return hour >= 22 || hour < 5;
  });
};
