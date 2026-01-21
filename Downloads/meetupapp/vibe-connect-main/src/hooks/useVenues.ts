import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS, apiUpload } from '@/lib/api';

export interface Venue {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  image?: string;
  website?: string;
  phone?: string;
  capacity?: number;
  amenities: string[];
  _count?: {
    meetups: number;
  };
}

export const useVenues = (filters?: {
  city?: string;
  search?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}) => {
  return useQuery({
    queryKey: ['venues', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.city) params.append('city', filters.city);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.latitude) params.append('latitude', filters.latitude.toString());
      if (filters?.longitude) params.append('longitude', filters.longitude.toString());
      if (filters?.radius) params.append('radius', filters.radius.toString());
      
      const url = `${API_ENDPOINTS.VENUES.LIST}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiRequest<{ success: boolean; data: Venue[] }>(url);
      return response.data;
    },
    retry: false,
    onError: (error) => {
      console.error('Failed to fetch venues:', error);
    },
  });
};

export const useNearbyVenues = (latitude: number, longitude: number, radius = 10) => {
  return useQuery({
    queryKey: ['venues', 'nearby', latitude, longitude, radius],
    queryFn: async () => {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString(),
      });
      
      const url = `${API_ENDPOINTS.VENUES.NEARBY}?${params.toString()}`;
      const response = await apiRequest<{ success: boolean; data: Venue[] }>(url);
      return response.data;
    },
    enabled: !!latitude && !!longitude,
  });
};

export const useVenue = (id: string) => {
  return useQuery({
    queryKey: ['venue', id],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: Venue }>(
        API_ENDPOINTS.VENUES.DETAIL(id)
      );
      return response.data;
    },
    enabled: !!id,
  });
};
