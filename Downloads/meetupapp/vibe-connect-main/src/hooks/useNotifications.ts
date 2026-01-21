import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export const useNotifications = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: Notification[]; unreadCount: number }>(
        API_ENDPOINTS.NOTIFICATIONS.LIST
      );
      return response;
    },
    enabled,
    retry: false,
    onError: (error) => {
      console.error('Failed to fetch notifications:', error);
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return apiRequest(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
