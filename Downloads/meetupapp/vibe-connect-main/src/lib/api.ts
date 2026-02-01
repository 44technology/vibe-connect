/**
 * API Configuration and Client
 * Backend API base URL configuration
 */

// DUMMY MODE: Set to true to use mock data instead of real backend
// This allows the app to work without a backend server
const USE_DUMMY_DATA = true; // Set to false to use real backend

// Auto-detect API URL based on current host
const getApiBaseUrl = (): string => {
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Auto-detect based on current host
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // If accessing from mobile device (IP address), use same IP for backend
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Backend port (default 5000)
      const backendPort = import.meta.env.VITE_BACKEND_PORT || '5000';
      return `http://${hostname}:${backendPort}/api`;
    }
  }

  // Default to localhost
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    GOOGLE: `${API_BASE_URL}/auth/google`,
    APPLE: `${API_BASE_URL}/auth/apple`,
    SEND_OTP: `${API_BASE_URL}/auth/otp/send`,
    VERIFY_OTP: `${API_BASE_URL}/auth/otp/verify`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  // Users
  USERS: {
    SEARCH: `${API_BASE_URL}/users`,
    PROFILE: (userId?: string) => `${API_BASE_URL}/users${userId ? `/${userId}` : ''}`,
    STATS: (userId?: string) => `${API_BASE_URL}/users/stats${userId ? `/${userId}` : ''}`,
    UPDATE: `${API_BASE_URL}/users`,
    AVATAR: `${API_BASE_URL}/users/avatar`,
  },
  // Meetups
  MEETUPS: {
    LIST: `${API_BASE_URL}/meetups`,
    NEARBY: `${API_BASE_URL}/meetups/nearby`,
    DETAIL: (id: string) => `${API_BASE_URL}/meetups/${id}`,
    CREATE: `${API_BASE_URL}/meetups`,
    UPDATE: (id: string) => `${API_BASE_URL}/meetups/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/meetups/${id}`,
    JOIN: (id: string) => `${API_BASE_URL}/meetups/${id}/join`,
    LEAVE: (id: string) => `${API_BASE_URL}/meetups/${id}/leave`,
  },
  // Venues
  VENUES: {
    LIST: `${API_BASE_URL}/venues`,
    NEARBY: `${API_BASE_URL}/venues/nearby`,
    DETAIL: (id: string) => `${API_BASE_URL}/venues/${id}`,
    CREATE: `${API_BASE_URL}/venues`,
    UPDATE: (id: string) => `${API_BASE_URL}/venues/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/venues/${id}`,
  },
  // Chats
  CHATS: {
    LIST: `${API_BASE_URL}/chats`,
    DETAIL: (id: string) => `${API_BASE_URL}/chats/${id}`,
    MESSAGES: (id: string) => `${API_BASE_URL}/chats/${id}/messages`,
    DIRECT: `${API_BASE_URL}/chats/direct`,
    GROUP: `${API_BASE_URL}/chats/group`,
    SEND_MESSAGE: (id: string) => `${API_BASE_URL}/chats/${id}/messages`,
  },
  // Matches
  MATCHES: {
    LIST: `${API_BASE_URL}/matches`,
    DETAIL: (id: string) => `${API_BASE_URL}/matches/${id}`,
    CREATE: `${API_BASE_URL}/matches`,
    UPDATE: (id: string) => `${API_BASE_URL}/matches/${id}`,
  },
  // Classes
  CLASSES: {
    LIST: `${API_BASE_URL}/classes`,
    NEARBY: `${API_BASE_URL}/classes/nearby`,
    MY_CLASSES: `${API_BASE_URL}/classes/my-classes`,
    DETAIL: (id: string) => `${API_BASE_URL}/classes/${id}`,
    CREATE: `${API_BASE_URL}/classes`,
    ENROLL: (id: string) => `${API_BASE_URL}/classes/${id}/enroll`,
    CANCEL_ENROLLMENT: (id: string) => `${API_BASE_URL}/classes/${id}/enroll`,
  },
  // Tickets
  TICKETS: {
    LIST: `${API_BASE_URL}/tickets`,
    MY_TICKETS: `${API_BASE_URL}/tickets/my-tickets`,
    DETAIL: (id: string) => `${API_BASE_URL}/tickets/${id}`,
    CREATE_FOR_CLASS: (classId: string) => `${API_BASE_URL}/tickets/class/${classId}`,
    CREATE_FOR_MEETUP: (meetupId: string) => `${API_BASE_URL}/tickets/meetup/${meetupId}`,
  },
  // Mentors
  MENTORS: {
    LIST: `${API_BASE_URL}/mentors`,
    DETAIL: (id: string) => `${API_BASE_URL}/mentors/${id}`,
  },
  // Suggestions
  SUGGESTIONS: {
    CLASSES: `${API_BASE_URL}/suggestions/classes`,
    REQUEST_CLASS: `${API_BASE_URL}/suggestions/classes/request`,
  },
  // Notifications
  NOTIFICATIONS: {
    LIST: `${API_BASE_URL}/notifications`,
    MARK_READ: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/read-all`,
    DELETE: (id: string) => `${API_BASE_URL}/notifications/${id}`,
  },
  // Stories
  STORIES: {
    LIST: `${API_BASE_URL}/stories`,
    CREATE: `${API_BASE_URL}/stories`,
    VIEW: (id: string) => `${API_BASE_URL}/stories/${id}/view`,
  },
  // Posts
  POSTS: {
    LIST: `${API_BASE_URL}/posts`,
    CREATE: `${API_BASE_URL}/posts`,
    LIKE: (id: string) => `${API_BASE_URL}/posts/${id}/like`,
    COMMENT: (id: string) => `${API_BASE_URL}/posts/${id}/comment`,
    COMMENTS: (id: string) => `${API_BASE_URL}/posts/${id}/comments`,
  },
};

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Set authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

/**
 * API request helper with authentication
 */
export const apiRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  // Use mock API if dummy mode is enabled
  if (USE_DUMMY_DATA) {
    const { mockApiRequest } = await import('./mockApi');
    return mockApiRequest<T>(url, options);
  }

  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let errorData: any = {};
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
    } catch {
      errorMessage = `HTTP error! status: ${response.status}`;
    }
    // Preserve full error data for better error handling
    const error = new Error(errorMessage);
    (error as any).response = { data: errorData, status: response.status };
    throw error;
  }

  return response.json();
};

/**
 * API request for file uploads
 */
export const apiUpload = async <T = any>(
  url: string,
  file: File,
  additionalData?: Record<string, any>
): Promise<T> => {
  // Use mock API if dummy mode is enabled
  if (USE_DUMMY_DATA) {
    const { mockApiUpload } = await import('./mockApi');
    return mockApiUpload<T>(url, file, additionalData);
  }

  const token = getAuthToken();
  
  const formData = new FormData();
  formData.append('image', file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
    });
  }

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || `Upload error! status: ${response.status}`);
  }

  return response.json();
};

export default API_ENDPOINTS;
