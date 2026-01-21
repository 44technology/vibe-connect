import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';

export interface Class {
  id: string;
  title: string;
  description: string;
  skill: string;
  category?: string;
  image?: string;
  startTime: string;
  endTime?: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  maxStudents?: number;
  price?: number;
  schedule?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  venue: {
    id: string;
    name: string;
    address: string;
    city: string;
    image?: string;
  };
  enrollments?: Array<{
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
    enrollments: number;
  };
  distance?: number;
}

export const useClasses = (skill?: string, category?: string, status?: string, venueId?: string, enrolled?: boolean) => {
  return useQuery({
    queryKey: ['classes', skill, category, status, venueId, enrolled],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (skill) params.append('skill', skill);
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      if (venueId) params.append('venueId', venueId);
      if (enrolled) params.append('enrolled', 'true');
      
      const url = `${API_ENDPOINTS.CLASSES.LIST}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiRequest<{ success: boolean; data: Class[] }>(url);
      return response.data;
    },
  });
};

export const useNearbyClasses = (latitude: number, longitude: number, radius = 10) => {
  return useQuery({
    queryKey: ['classes', 'nearby', latitude, longitude, radius],
    queryFn: async () => {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString(),
      });
      
      const url = `${API_ENDPOINTS.CLASSES.NEARBY}?${params.toString()}`;
      const response = await apiRequest<{ success: boolean; data: Class[] }>(url);
      return response.data;
    },
    enabled: !!latitude && !!longitude,
  });
};

export const useClass = (id: string) => {
  return useQuery({
    queryKey: ['class', id],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: Class }>(
        API_ENDPOINTS.CLASSES.DETAIL(id)
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useEnrollInClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classId: string) => {
      const response = await apiRequest<{ success: boolean; data: any }>(
        API_ENDPOINTS.CLASSES.ENROLL(classId),
        {
          method: 'POST',
        }
      );
      return response.data;
    },
    onSuccess: (_, classId) => {
      queryClient.invalidateQueries({ queryKey: ['class', classId] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};

export const useCancelEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classId: string) => {
      const response = await apiRequest<{ success: boolean; message: string }>(
        API_ENDPOINTS.CLASSES.CANCEL_ENROLLMENT(classId),
        {
          method: 'DELETE',
        }
      );
      return response;
    },
    onSuccess: (_, classId) => {
      queryClient.invalidateQueries({ queryKey: ['class', classId] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};
