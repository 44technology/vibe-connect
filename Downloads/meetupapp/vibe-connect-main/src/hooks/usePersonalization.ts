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
    return getContextualRecommendation();
  }, []);

  // Get current time slot
  const currentTimeSlot = useMemo(() => {
    return getCurrentTimeSlot();
  }, []);

  // Personalize meetups
  const personalize = (
    meetups: Meetup[],
    userLocation?: { latitude: number; longitude: number }
  ): Meetup[] => {
    if (!user?.id) return meetups;
    return personalizeMeetups(meetups, user.id, userLocation, user.interests);
  };

  // Get top recommendations
  const getRecommendations = (
    meetups: Meetup[],
    userLocation?: { latitude: number; longitude: number },
    limit: number = 10
  ): Meetup[] => {
    if (!user?.id) return meetups.slice(0, limit);
    return getTopRecommendations(meetups, user.id, userLocation, user.interests, limit);
  };

  // Track meetup join
  const trackJoin = (meetup: Meetup): void => {
    if (!user?.id) return;
    trackMeetupJoin(user.id, meetup);
  };

  // Get user behavior
  const behavior = useMemo(() => {
    if (!user?.id) return null;
    return getUserBehavior(user.id);
  }, [user?.id]);

  // Get user preferences
  const preferences = useMemo(() => {
    if (!user?.id) return null;
    return getUserPreferences(user.id);
  }, [user?.id]);

  // Update preferences
  const updatePreferences = (newPreferences: Partial<typeof preferences>) => {
    if (!user?.id) return;
    updateUserPreferences(user.id, newPreferences);
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
