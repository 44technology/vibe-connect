import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';

export interface Ticket {
  id: string;
  ticketNumber: string;
  qrCode: string;
  qrCodeImage?: string | null;
  status: 'ACTIVE' | 'USED' | 'CANCELLED' | 'EXPIRED';
  price: number;
  purchasedAt: string;
  usedAt?: string | null;
  expiresAt?: string | null;
  class?: {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime?: string;
    venue?: {
      name: string;
      address: string;
      city: string;
    };
    instructor?: {
      name: string;
      avatar?: string;
    };
  };
  meetup?: {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime?: string;
    venue?: {
      name: string;
      address: string;
      city: string;
    };
  };
}

export const useMyTickets = () => {
  return useQuery<Ticket[]>({
    queryKey: ['tickets', 'my-tickets'],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: Ticket[] }>(
        API_ENDPOINTS.TICKETS.MY_TICKETS,
        { method: 'GET' }
      );
      return response.data;
    },
  });
};

export const useTicket = (ticketId: string) => {
  return useQuery<Ticket>({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: Ticket }>(
        API_ENDPOINTS.TICKETS.DETAIL(ticketId),
        { method: 'GET' }
      );
      return response.data;
    },
    enabled: !!ticketId,
  });
};

export const useCreateTicketForClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classId: string) => {
      const response = await apiRequest<{ success: boolean; data: Ticket }>(
        API_ENDPOINTS.TICKETS.CREATE_FOR_CLASS(classId),
        {
          method: 'POST',
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useCreateTicketForMeetup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meetupId: string) => {
      const response = await apiRequest<{ success: boolean; data: Ticket }>(
        API_ENDPOINTS.TICKETS.CREATE_FOR_MEETUP(meetupId),
        {
          method: 'POST',
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};
