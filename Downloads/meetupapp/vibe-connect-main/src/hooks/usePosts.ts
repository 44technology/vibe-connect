import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, apiUpload, API_ENDPOINTS } from '@/lib/api';

export interface Post {
  id: string;
  content?: string;
  image?: string;
  userId: string;
  venueId?: string;
  meetupId?: string;
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
    likes: number;
    comments: number;
  };
}

export const usePosts = (venueId?: string, meetupId?: string) => {
  return useQuery({
    queryKey: ['posts', venueId, meetupId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (venueId) params.append('venueId', venueId);
      if (meetupId) params.append('meetupId', meetupId);
      
      const url = `${API_ENDPOINTS.POSTS.LIST}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiRequest<{ success: boolean; data: Post[] }>(url);
      return response.data;
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, image, venueId, meetupId }: { content?: string; image?: File; venueId?: string; meetupId?: string }) => {
      if (image) {
        // Upload with image
        const additionalData: Record<string, any> = {};
        if (content) additionalData.content = content;
        if (venueId) additionalData.venueId = venueId;
        if (meetupId) additionalData.meetupId = meetupId;

        const response = await apiUpload<{ success: boolean; data: Post }>(
          API_ENDPOINTS.POSTS.CREATE,
          image,
          additionalData
        );
        return response.data;
      } else {
        // Create without image
        const response = await apiRequest<{ success: boolean; data: Post }>(
          API_ENDPOINTS.POSTS.CREATE,
          {
            method: 'POST',
            body: JSON.stringify({ content, venueId, meetupId }),
          }
        );
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest<{ success: boolean; message: string; liked: boolean }>(
        API_ENDPOINTS.POSTS.LIKE(postId),
        {
          method: 'POST',
        }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useCommentPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const response = await apiRequest<{ success: boolean; data: any }>(
        API_ENDPOINTS.POSTS.COMMENT(postId),
        {
          method: 'POST',
          body: JSON.stringify({ content }),
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post-comments', variables.postId] });
    },
  });
};

export interface PostComment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    avatar?: string;
  };
}

export const usePostComments = (postId: string) => {
  return useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: PostComment[] }>(
        API_ENDPOINTS.POSTS.COMMENTS(postId)
      );
      return response.data;
    },
    enabled: !!postId,
  });
};
