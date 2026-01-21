import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, apiUpload, API_ENDPOINTS } from '@/lib/api';

export interface Story {
  id: string;
  image: string;
  userId: string;
  venueId?: string;
  meetupId?: string;
  expiresAt: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    avatar?: string;
  };
  venue?: {
    id: string;
    name: string;
  };
  meetup?: {
    id: string;
    title: string;
  };
  _count?: {
    views: number;
  };
}

export const useStories = () => {
  return useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: Story[] }>(
        API_ENDPOINTS.STORIES.LIST
      );
      return response.data;
    },
  });
};

export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ image, venueId, meetupId }: { image: File; venueId?: string; meetupId?: string }) => {
      const additionalData: Record<string, any> = {};
      if (venueId) additionalData.venueId = venueId;
      if (meetupId) additionalData.meetupId = meetupId;

      const response = await apiUpload<{ success: boolean; data: Story }>(
        API_ENDPOINTS.STORIES.CREATE,
        image,
        additionalData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
};

export const useViewStory = () => {
  return useMutation({
    mutationFn: async (storyId: string) => {
      const response = await apiRequest<{ success: boolean; message: string }>(
        API_ENDPOINTS.STORIES.VIEW(storyId),
        {
          method: 'POST',
        }
      );
      return response;
    },
  });
};
