import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS, apiUpload } from '@/lib/api';

export interface LearnRequest {
  id: string;
  title: string;
  description: string;
  skill: string;
  category?: string;
  image?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    avatar?: string;
  };
  responses?: LearnResponse[];
  _count?: {
    responses: number;
  };
}

export interface LearnResponse {
  id: string;
  learnRequestId: string;
  responseType: 'USER' | 'VENUE';
  message: string;
  price?: number;
  availability?: string;
  createdAt: string;
  user?: {
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
    image?: string;
  };
}

export const useLearnRequests = (skill?: string, category?: string, status?: string) => {
  return useQuery({
    queryKey: ['learnRequests', skill, category, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (skill) params.append('skill', skill);
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      
      const url = `${API_ENDPOINTS.LEARN.LIST}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiRequest<{ success: boolean; data: LearnRequest[] }>(url);
      return response.data;
    },
  });
};

export const useLearnRequest = (id: string) => {
  return useQuery({
    queryKey: ['learnRequest', id],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: LearnRequest }>(
        API_ENDPOINTS.LEARN.DETAIL(id)
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateLearnRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      skill: string;
      category?: string;
      latitude?: number;
      longitude?: number;
      image?: File;
    }) => {
      if (data.image) {
        const response = await apiUpload<{ success: boolean; data: LearnRequest }>(
          API_ENDPOINTS.LEARN.CREATE,
          data.image,
          data
        );
        return response.data;
      } else {
        const response = await apiRequest<{ success: boolean; data: LearnRequest }>(
          API_ENDPOINTS.LEARN.CREATE,
          {
            method: 'POST',
            body: JSON.stringify(data),
          }
        );
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learnRequests'] });
    },
  });
};

export const useCreateLearnResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      learnRequestId: string;
      message: string;
      price?: number;
      availability?: string;
      responseType: 'USER' | 'VENUE';
      venueId?: string;
    }) => {
      const response = await apiRequest<{ success: boolean; data: LearnResponse }>(
        API_ENDPOINTS.LEARN.CREATE_RESPONSE(data.learnRequestId),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['learnRequest', variables.learnRequestId] });
      queryClient.invalidateQueries({ queryKey: ['learnRequests'] });
    },
  });
};
