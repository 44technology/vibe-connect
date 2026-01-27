import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS, getAuthToken } from '@/lib/api';

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  members: Array<{
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      displayName?: string;
      avatar?: string;
    };
  }>;
  messages?: Message[];
  _count?: {
    messages: number;
  };
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  image?: string;
  senderId: string;
  chatId: string;
  read: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    avatar?: string;
  };
}

export const useChats = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: Chat[] }>(
        API_ENDPOINTS.CHATS.LIST
      );
      return response.data;
    },
  });
};

export const useChat = (chatId: string | null) => {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      if (!chatId) return null;
      const response = await apiRequest<{ success: boolean; data: Chat }>(
        API_ENDPOINTS.CHATS.DETAIL(chatId)
      );
      return response.data;
    },
    enabled: !!chatId,
  });
};

export const useMessages = (chatId: string | null) => {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      if (!chatId) return [];
      const response = await apiRequest<{ success: boolean; data: Message[] }>(
        API_ENDPOINTS.CHATS.MESSAGES(chatId)
      );
      return response.data;
    },
    enabled: !!chatId,
  });
};

export const useCreateDirectChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest<{ success: boolean; data: Chat }>(
        API_ENDPOINTS.CHATS.DIRECT,
        {
          method: 'POST',
          body: JSON.stringify({ userId }),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, content }: { chatId: string; content: string }) => {
      const response = await apiRequest<{ success: boolean; data: Message }>(
        API_ENDPOINTS.CHATS.SEND_MESSAGE(chatId),
        {
          method: 'POST',
          body: JSON.stringify({ content }),
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chat', variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

// Socket.io hook for real-time messaging
export const useChatSocket = (chatId: string | null, onNewMessage?: (message: Message) => void) => {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Skip socket connection in dummy mode (USE_DUMMY_DATA is always true)
    // Real-time features won't work but messages will still be sent via API
    const USE_DUMMY_DATA = true;
    if (USE_DUMMY_DATA) {
      console.log('Socket.io disabled in dummy mode - using API for messages');
      return;
    }

    const token = getAuthToken();
    if (!token || !chatId) return;

    // Get API base URL
    const getApiBaseUrl = (): string => {
      if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace('/api', '');
      }
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
          const backendPort = import.meta.env.VITE_BACKEND_PORT || '5000';
          return `http://${hostname}:${backendPort}`;
        }
      }
      return 'http://localhost:5000';
    };

    const socket = io(getApiBaseUrl(), {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('join-chat', chatId);
    });

    socket.on('joined-chat', () => {
      console.log('Joined chat:', chatId);
    });

    socket.on('new-message', (message: Message) => {
      console.log('New message received:', message);
      queryClient.setQueryData(['messages', chatId], (old: Message[] = []) => {
        if (old.find((m) => m.id === message.id)) return old;
        return [...old, message];
      });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      onNewMessage?.(message);
    });

    socket.on('error', (error: string) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [chatId, queryClient, onNewMessage]);

  const sendMessage = (content: string) => {
    // In dummy mode, messages are sent via API, not socket
    if (!chatId) return;
    // This will be handled by useSendMessage hook instead
  };

  return { sendMessage, socket: socketRef.current };
};
