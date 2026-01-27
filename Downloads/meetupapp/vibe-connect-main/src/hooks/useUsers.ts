import { useQuery } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';

export interface SpotifyTrack {
  name: string;
  artist: string;
  album?: string;
  image?: string;
  url?: string;
  playedAt?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  lookingFor?: string[];
  photos?: string[];
  isVerified: boolean;
  spotifyConnected?: boolean;
  spotifyLastTrack?: SpotifyTrack;
  createdAt: string;
}

export const useUser = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest<{ success: boolean; data: User }>(
        API_ENDPOINTS.USERS.PROFILE(userId)
      );
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useSearchUsers = (query?: string) => {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      
      const url = `${API_ENDPOINTS.USERS.SEARCH}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiRequest<{ success: boolean; data: User[] }>(url);
      return response.data;
    },
    enabled: !!query && query.length > 0,
  });
};
