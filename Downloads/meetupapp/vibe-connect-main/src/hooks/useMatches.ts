import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';

export interface Match {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    avatar?: string;
    bio?: string;
  };
  isSender: boolean;
}

export const useMatches = (status?: 'PENDING' | 'ACCEPTED' | 'REJECTED') => {
  return useQuery({
    queryKey: ['matches', status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      
      const url = `${API_ENDPOINTS.MATCHES.LIST}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiRequest<{ success: boolean; data: Match[] }>(url);
      return response.data;
    },
  });
};

export const useCreateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (receiverId: string) => {
      const response = await apiRequest<{ success: boolean; data: any }>(
        API_ENDPOINTS.MATCHES.CREATE,
        {
          method: 'POST',
          body: JSON.stringify({ receiverId }),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useUpdateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: 'ACCEPTED' | 'REJECTED' }) => {
      const response = await apiRequest<{ success: boolean; data: any }>(
        API_ENDPOINTS.MATCHES.UPDATE(matchId),
        {
          method: 'PUT',
          body: JSON.stringify({ status }),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};
