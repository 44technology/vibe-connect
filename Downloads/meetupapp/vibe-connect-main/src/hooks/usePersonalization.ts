import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Meetup } from './useMeetups';
import {
  personalizeMeetups,
  getTopRecommendations,
  getContextualRecommendation,
  getCurrentTimeSlot,
  trackMeetupJoin,
  getUserBehavior,
  getUserPreferences,
  updateUserPreferences,
} from '@/lib/personalization';

export const usePersonalization = () => {
  const { user } = useAuth();

  // Get contextual recommendation
  const contextualRecommendation = useMemo(() => {
    try {
      return getContextualRecommendation();
    } catch (error) {
      console.warn('Error getting contextual recommendation:', error);
      return { type: 'general' as const, message: 'Discover new meetups' };
    }
  }, []);

  // Get current time slot
  const currentTimeSlot = useMemo(() => {
    try {
      return getCurrentTimeSlot();
    } catch (error) {
      console.warn('Error getting time slot:', error);
      return 'afternoon' as const;
    }
  }, []);

  // Personalize meetups
  const personalize = (
    meetups: Meetup[],
    userLocation?: { latitude: number; longitude: number }
  ): Meetup[] => {
    try {
      if (!user?.id) return meetups;
      return personalizeMeetups(meetups, user.id, userLocation, (user as any).interests || []);
    } catch (error) {
      console.warn('Error personalizing meetups:', error);
      return meetups;
    }
  };

  // Get top recommendations
  const getRecommendations = (
    meetups: Meetup[],
    userLocation?: { latitude: number; longitude: number },
    limit: number = 10
  ): Meetup[] => {
    try {
      if (!user?.id) return meetups.slice(0, limit);
      return getTopRecommendations(meetups, user.id, userLocation, (user as any).interests || [], limit);
    } catch (error) {
      console.warn('Error getting recommendations:', error);
      return meetups.slice(0, limit);
    }
  };

  // Track meetup join
  const trackJoin = (meetup: Meetup): void => {
    try {
      if (!user?.id) return;
      trackMeetupJoin(user.id, meetup);
    } catch (error) {
      console.warn('Error tracking join:', error);
    }
  };

  // Get user behavior
  const behavior = useMemo(() => {
    try {
      if (!user?.id) return null;
      return getUserBehavior(user.id);
    } catch (error) {
      console.warn('Error getting user behavior:', error);
      return null;
    }
  }, [user?.id]);

  // Get user preferences
  const preferences = useMemo(() => {
    try {
      if (!user?.id) return null;
      return getUserPreferences(user.id);
    } catch (error) {
      console.warn('Error getting user preferences:', error);
      return null;
    }
  }, [user?.id]);

  // Update preferences
  const updatePreferences = (newPreferences: Partial<typeof preferences>) => {
    try {
      if (!user?.id) return;
      updateUserPreferences(user.id, newPreferences);
    } catch (error) {
      console.warn('Error updating preferences:', error);
    }
  };

  return {
    personalize,
    getRecommendations,
    trackJoin,
    contextualRecommendation,
    currentTimeSlot,
    behavior,
    preferences,
    updatePreferences,
  };
};
