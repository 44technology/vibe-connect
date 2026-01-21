import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS, apiUpload } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface Meetup {
  id: string;
  title: string;
  description?: string;
  image?: string;
  startTime: string;
  endTime?: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  maxAttendees?: number;
  category?: string;
  tags: string[];
  latitude?: number;
  longitude?: number;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    avatar?: string;
  };
  venue?: {
    id: string;
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  members?: Array<{
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      displayName?: string;
      avatar?: string;
    };
    status: string;
  }>;
  _count?: {
    members: number;
  };
}

export const useMeetups = (filters?: {
  category?: string;
  status?: string;
  search?: string;
  isFree?: boolean;
  isPublic?: boolean;
  priceMin?: number;
  priceMax?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}) => {
  return useQuery({
    queryKey: ['meetups', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.isFree !== undefined) params.append('isFree', filters.isFree.toString());
      if (filters?.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString());
      if (filters?.priceMin) params.append('priceMin', filters.priceMin.toString());
      if (filters?.priceMax) params.append('priceMax', filters.priceMax.toString());
      if (filters?.latitude) params.append('latitude', filters.latitude.toString());
      if (filters?.longitude) params.append('longitude', filters.longitude.toString());
      if (filters?.radius) params.append('radius', filters.radius.toString());
      
      const url = `${API_ENDPOINTS.MEETUPS.LIST}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiRequest<{ success: boolean; data: Meetup[] }>(url);
      return response.data;
    },
    retry: false,
    onError: (error) => {
      console.error('Failed to fetch meetups:', error);
    },
  });
};

export const useNearbyMeetups = (latitude: number, longitude: number, radius = 10) => {
  return useQuery({
    queryKey: ['meetups', 'nearby', latitude, longitude, radius],
    queryFn: async () => {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString(),
      });
      
      const url = `${API_ENDPOINTS.MEETUPS.NEARBY}?${params.toString()}`;
      const response = await apiRequest<{ success: boolean; data: Meetup[] }>(url);
      return response.data;
    },
    enabled: !!latitude && !!longitude,
  });
};

export const useMeetup = (id: string) => {
  return useQuery({
    queryKey: ['meetup', id],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: Meetup }>(
        API_ENDPOINTS.MEETUPS.DETAIL(id)
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateMeetup = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      startTime: string;
      endTime?: string;
      maxAttendees?: number;
      category?: string;
      tags?: string[];
      venueId?: string;
      latitude?: number;
      longitude?: number;
      location?: string;
      isPublic?: boolean;
      isFree?: boolean;
      pricePerPerson?: number;
      isBlindMeet?: boolean;
      image?: File;
    }) => {
      if (data.image) {
        const formData = new FormData();
        formData.append('image', data.image);
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'image' && value !== undefined) {
            formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
          }
        });
        
        const response = await apiUpload<{ success: boolean; data: Meetup }>(
          API_ENDPOINTS.MEETUPS.CREATE,
          data.image,
          data
        );
        return response.data;
      } else {
        const response = await apiRequest<{ success: boolean; data: Meetup }>(
          API_ENDPOINTS.MEETUPS.CREATE,
          {
            method: 'POST',
            body: JSON.stringify(data),
          }
        );
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetups'] });
    },
  });
};

export const useJoinMeetup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ meetupId, status = 'going' }: { meetupId: string; status?: string }) => {
      const response = await apiRequest<{ success: boolean; data: any }>(
        API_ENDPOINTS.MEETUPS.JOIN(meetupId),
        {
          method: 'POST',
          body: JSON.stringify({ status }),
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetup', variables.meetupId] });
      queryClient.invalidateQueries({ queryKey: ['meetups'] });
    },
  });
};
