/**
 * Mock API Service - Dummy Data Implementation
 * This replaces all backend API calls with dummy data stored in localStorage
 */

// OTP storage - phone -> code mapping
const OTP_STORAGE_KEY = 'mock_otp_codes';
const USER_STORAGE_KEY = 'mock_users';
const MEETUP_STORAGE_KEY = 'mock_meetups';
const VENUE_STORAGE_KEY = 'mock_venues';
const CHAT_STORAGE_KEY = 'mock_chats';
const MESSAGE_STORAGE_KEY = 'mock_messages';
const POST_STORAGE_KEY = 'mock_posts';
const STORY_STORAGE_KEY = 'mock_stories';
const CLASS_STORAGE_KEY = 'mock_classes';
const NOTIFICATION_STORAGE_KEY = 'mock_notifications';
const MATCH_STORAGE_KEY = 'mock_matches';

// Helper functions
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

const getStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

// Generate dummy OTP code
const generateOTP = (): string => {
  return '123456'; // Always return same code for easy testing
};

// Generate ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Dummy user data
const getDummyUser = (id: string, data?: any) => ({
  id,
  firstName: data?.firstName || 'John',
  lastName: data?.lastName || 'Doe',
  displayName: data?.displayName || `${data?.firstName || 'John'} ${data?.lastName || 'Doe'}`,
  email: data?.email || `user${id}@example.com`,
  phone: data?.phone || '+1234567890',
  avatar: data?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  bio: data?.bio || 'New to the app!',
  photos: data?.photos || [],
  interests: data?.interests || [],
  lookingFor: data?.lookingFor || [],
  isVerified: true,
  createdAt: new Date().toISOString(),
});

// Initialize dummy data
const initDummyData = () => {
  // Initialize meetups if empty
  const meetups = getStorage(MEETUP_STORAGE_KEY, []);
  if (meetups.length === 0) {
    const dummyMeetups = [
      {
        id: '1',
        title: 'Saturday Morning Coffee & Chat',
        description: 'Join us for a casual coffee meetup in Wynwood',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING' as const,
        maxAttendees: 6,
        category: 'Coffee',
        tags: ['coffee', 'social', 'networking'],
        latitude: 25.7617,
        longitude: -80.1918,
        creator: {
          id: 'user-1',
          firstName: 'Sarah',
          lastName: 'Miller',
          displayName: 'Sarah M.',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        },
        venue: {
          id: 'venue-1',
          name: 'Panther Coffee',
          address: '2390 NW 2nd Ave, Miami',
          city: 'Miami',
          latitude: 25.7617,
          longitude: -80.1918,
        },
        members: [],
        _count: { members: 0 },
      },
      {
        id: '2',
        title: 'Tennis Doubles Match',
        description: 'Looking for tennis partners for doubles',
        image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400',
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING' as const,
        maxAttendees: 4,
        category: 'Sports',
        tags: ['tennis', 'sports', 'fitness'],
        latitude: 25.7907,
        longitude: -80.1300,
        creator: {
          id: 'user-2',
          firstName: 'James',
          lastName: 'Keller',
          displayName: 'James K.',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        },
        venue: {
          id: 'venue-2',
          name: 'Flamingo Park Tennis',
          address: '1200 Jefferson Ave, Miami Beach',
          city: 'Miami Beach',
          latitude: 25.7907,
          longitude: -80.1300,
        },
        members: [],
        _count: { members: 0 },
      },
    ];
    setStorage(MEETUP_STORAGE_KEY, dummyMeetups);
  }

  // Initialize venues if empty
  const venues = getStorage(VENUE_STORAGE_KEY, []);
  if (venues.length === 0) {
    const dummyVenues = [
      {
        id: 'venue-1',
        name: 'Panther Coffee',
        address: '2390 NW 2nd Ave, Miami',
        city: 'Miami',
        category: 'Café',
        latitude: 25.7617,
        longitude: -80.1918,
        rating: 4.8,
        reviewCount: 342,
        priceRange: '$$',
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
      },
      {
        id: 'venue-2',
        name: 'Zuma Miami',
        address: '270 Biscayne Blvd Way, Miami',
        city: 'Miami',
        category: 'Japanese',
        latitude: 25.7753,
        longitude: -80.1889,
        rating: 4.7,
        reviewCount: 512,
        priceRange: '$$$$',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      },
    ];
    setStorage(VENUE_STORAGE_KEY, dummyVenues);
  }

  // Initialize chats if empty
  const chats = getStorage(CHAT_STORAGE_KEY, []);
  if (chats.length === 0) {
    const dummyChats = [
      {
        id: 'chat-1',
        type: 'direct' as const,
        members: [
          {
            id: 'member-1',
            user: {
              id: 'user-1',
              firstName: 'Sarah',
              lastName: 'Miller',
              displayName: 'Sarah M.',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            },
          },
        ],
        updatedAt: new Date().toISOString(),
        _count: { messages: 0 },
      },
    ];
    setStorage(CHAT_STORAGE_KEY, dummyChats);
  }

  // Initialize notifications if empty
  const notifications = getStorage(NOTIFICATION_STORAGE_KEY, []);
  if (notifications.length === 0) {
    const dummyNotifications = [
      {
        id: 'notif-1',
        type: 'MEETUP_INVITE',
        title: 'New meetup invitation',
        message: 'Sarah invited you to Saturday Morning Coffee & Chat',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
    setStorage(NOTIFICATION_STORAGE_KEY, dummyNotifications);
  }
};

// Initialize on import
initDummyData();

// Mock API implementation
export const mockApiRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  await delay(300); // Simulate network delay

  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : {};
  const urlObj = new URL(url, 'http://localhost');
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  // Get current user from token
  const token = localStorage.getItem('authToken');
  const currentUserId = token ? 'current-user' : null;

  // Auth endpoints
  if (pathname.includes('/auth/register')) {
    const userId = 'current-user';
    const user = getDummyUser(userId, body);
    const newToken = `dummy_token_${Date.now()}`;
    setStorage('authToken', newToken);
    setStorage(`${USER_STORAGE_KEY}_${userId}`, user);
    return {
      success: true,
      data: {
        user,
        token: newToken,
      },
    } as T;
  }

  if (pathname.includes('/auth/login')) {
    // Check if user exists in storage
    let user = getStorage(`${USER_STORAGE_KEY}_current-user`, null);
    
    if (!user) {
      // Create new user with provided credentials
      user = getDummyUser('current-user', { 
        email: body.email, 
        phone: body.phone,
        firstName: body.email?.split('@')[0] || 'User',
        lastName: 'Name'
      });
      setStorage(`${USER_STORAGE_KEY}_current-user`, user);
    }

    const newToken = `dummy_token_${Date.now()}`;
    setStorage('authToken', newToken);
    return {
      success: true,
      data: {
        user,
        token: newToken,
      },
    } as T;
  }

  if (pathname.includes('/auth/otp/send')) {
    const code = generateOTP();
    const otps = getStorage(OTP_STORAGE_KEY, {});
    otps[body.phone] = { code, expiresAt: Date.now() + 10 * 60 * 1000 }; // 10 minutes
    setStorage(OTP_STORAGE_KEY, otps);
    
    // Show OTP in console for easy testing
    console.log('%c📱 OTP Code (dummy mode):', 'color: #4CAF50; font-size: 16px; font-weight: bold', code);
    console.log('%c💡 Tip:', 'color: #2196F3; font-weight: bold', `Use code "${code}" to verify your phone number`);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      otp: code, // Include in response for development
    } as T;
  }

  if (pathname.includes('/auth/otp/verify')) {
    // Always accept dummy code 123456 for easy testing
    const isValidCode = body.code === '123456' || body.code === '000000';
    
    if (!isValidCode) {
      // Still accept if OTP was sent before
      const otps = getStorage(OTP_STORAGE_KEY, {});
      const storedOtp = otps[body.phone];
      if (!storedOtp || storedOtp.code !== body.code) {
        return {
          success: false,
          message: 'Invalid OTP code. Use: 123456',
          verified: false,
        } as T;
      }
    }

    // Check if user exists
    let user = getStorage(`${USER_STORAGE_KEY}_current-user`, null);
    
    // If userData is provided (from onboarding), update/create user
    if (body.firstName && body.lastName) {
      user = getDummyUser('current-user', {
        phone: body.phone,
        firstName: body.firstName,
        lastName: body.lastName,
        displayName: body.displayName || `${body.firstName} ${body.lastName}`,
        ...(user || {}), // Preserve existing data
      });
      setStorage(`${USER_STORAGE_KEY}_current-user`, user);
    } else if (!user) {
      // Create minimal user if doesn't exist
      user = getDummyUser('current-user', { phone: body.phone });
      setStorage(`${USER_STORAGE_KEY}_current-user`, user);
    }

    const newToken = `dummy_token_${Date.now()}`;
    setStorage('authToken', newToken);
    
    // Clear OTP (if it exists)
    const otps = getStorage(OTP_STORAGE_KEY, {});
    if (otps[body.phone]) {
      delete otps[body.phone];
      setStorage(OTP_STORAGE_KEY, otps);
    }

    return {
      success: true,
      verified: true,
      data: {
        user,
        token: newToken,
      },
    } as T;
  }

  if (pathname.includes('/auth/google') || pathname.includes('/auth/apple')) {
    const user = getDummyUser('current-user', {
      email: body.email || `user${Date.now()}@example.com`,
      firstName: body.firstName || 'User',
      lastName: body.lastName || 'Name',
    });
    const newToken = `dummy_token_${Date.now()}`;
    setStorage('authToken', newToken);
    setStorage(`${USER_STORAGE_KEY}_current-user`, user);
    return {
      success: true,
      data: {
        user,
        token: newToken,
      },
    } as T;
  }

  if (pathname.includes('/auth/me')) {
    if (!currentUserId) {
      throw new Error('Unauthorized');
    }
    const user = getStorage(`${USER_STORAGE_KEY}_current-user`, getDummyUser('current-user'));
    return {
      success: true,
      data: user,
    } as T;
  }

  // Users endpoints
  if (pathname.includes('/users') && method === 'GET') {
    const pathParts = pathname.split('/').filter(p => p);
    const lastPart = pathParts[pathParts.length - 1];
    
    // Check if it's /users/stats
    if (lastPart === 'stats') {
      if (!currentUserId) throw new Error('Unauthorized');
      return {
        success: true,
        data: {
          connections: 24,
          meetups: 8,
          badges: 3,
          classes: 2,
        },
      } as T;
    }
    
    // Check if it's a specific user ID
    if (lastPart && lastPart !== 'users' && lastPart !== 'avatar') {
      const userId = lastPart;
      // Try to get from storage, otherwise return dummy
      const user = getStorage(`${USER_STORAGE_KEY}_${userId}`, null) || getDummyUser(userId);
      return {
        success: true,
        data: user,
      } as T;
    }
    
    // Search users (default endpoint)
    const query = searchParams.get('query') || '';
    const users = [
      getDummyUser('user-1', { firstName: 'Sarah', lastName: 'Miller', displayName: 'Sarah M.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }),
      getDummyUser('user-2', { firstName: 'James', lastName: 'Keller', displayName: 'James K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }),
      getDummyUser('user-3', { firstName: 'Emma', lastName: 'Wilson', displayName: 'Emma W.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' }),
    ].filter(u => 
      !query || 
      u.firstName.toLowerCase().includes(query.toLowerCase()) ||
      u.lastName.toLowerCase().includes(query.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(query.toLowerCase())
    );
    return {
      success: true,
      data: users,
    } as T;
  }

  if (pathname.includes('/users') && method === 'PUT') {
    if (!currentUserId) throw new Error('Unauthorized');
    const user = getStorage(`${USER_STORAGE_KEY}_current-user`, getDummyUser('current-user'));
    const updatedUser = { ...user, ...body, updatedAt: new Date().toISOString() };
    setStorage(`${USER_STORAGE_KEY}_current-user`, updatedUser);
    return {
      success: true,
      data: updatedUser,
    } as T;
  }

  if (pathname.includes('/users/avatar')) {
    if (!currentUserId) throw new Error('Unauthorized');
    // Simulate file upload - return a dummy URL
    const avatarUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150';
    const user = getStorage(`${USER_STORAGE_KEY}_current-user`, getDummyUser('current-user'));
    user.avatar = avatarUrl;
    setStorage(`${USER_STORAGE_KEY}_current-user`, user);
    return {
      success: true,
      data: { avatar: avatarUrl },
    } as T;
  }


  // Meetups endpoints
  if (pathname.includes('/meetups')) {
    const meetups = getStorage(MEETUP_STORAGE_KEY, []);

    if (method === 'GET') {
      const meetupId = pathname.split('/').pop();
      if (meetupId && meetupId !== 'meetups' && meetupId !== 'nearby') {
        // Get specific meetup
        const meetup = meetups.find((m: any) => m.id === meetupId);
        if (!meetup) throw new Error('Meetup not found');
        return {
          success: true,
          data: meetup,
        } as T;
      }
      // List meetups
      let filtered = [...meetups];
      if (searchParams.get('category')) {
        filtered = filtered.filter((m: any) => m.category === searchParams.get('category'));
      }
      if (searchParams.get('search')) {
        const search = searchParams.get('search')!.toLowerCase();
        filtered = filtered.filter((m: any) => 
          m.title.toLowerCase().includes(search) || 
          m.description?.toLowerCase().includes(search)
        );
      }
      return {
        success: true,
        data: filtered,
      } as T;
    }

    if (method === 'POST') {
      if (!currentUserId) throw new Error('Unauthorized');
      const newMeetup = {
        id: generateId(),
        ...body,
        creator: {
          id: 'current-user',
          firstName: 'Current',
          lastName: 'User',
          displayName: 'You',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        },
        members: [],
        _count: { members: 0 },
        createdAt: new Date().toISOString(),
      };
      meetups.push(newMeetup);
      setStorage(MEETUP_STORAGE_KEY, meetups);
      return {
        success: true,
        data: newMeetup,
      } as T;
    }

    if (method === 'PUT') {
      if (!currentUserId) throw new Error('Unauthorized');
      const meetupId = pathname.split('/').pop();
      const index = meetups.findIndex((m: any) => m.id === meetupId);
      if (index === -1) throw new Error('Meetup not found');
      meetups[index] = { ...meetups[index], ...body, updatedAt: new Date().toISOString() };
      setStorage(MEETUP_STORAGE_KEY, meetups);
      return {
        success: true,
        data: meetups[index],
      } as T;
    }

    if (method === 'DELETE') {
      if (!currentUserId) throw new Error('Unauthorized');
      const meetupId = pathname.split('/').pop();
      const filtered = meetups.filter((m: any) => m.id !== meetupId);
      setStorage(MEETUP_STORAGE_KEY, filtered);
      return {
        success: true,
        message: 'Meetup deleted',
      } as T;
    }
  }

  if (pathname.includes('/meetups') && pathname.includes('/join')) {
    if (!currentUserId) throw new Error('Unauthorized');
    const meetupId = pathname.split('/')[pathname.split('/').length - 2];
    const meetups = getStorage(MEETUP_STORAGE_KEY, []);
    const meetup = meetups.find((m: any) => m.id === meetupId);
    if (meetup) {
      const user = getStorage(`${USER_STORAGE_KEY}_current-user`, getDummyUser('current-user'));
      if (!meetup.members.find((m: any) => m.user.id === 'current-user')) {
        meetup.members.push({
          id: generateId(),
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            avatar: user.avatar,
          },
          status: body.status || 'going',
        });
        meetup._count.members = meetup.members.length;
        setStorage(MEETUP_STORAGE_KEY, meetups);
      }
    }
    return {
      success: true,
      data: meetup,
    } as T;
  }

  if (pathname.includes('/meetups') && pathname.includes('/leave')) {
    if (!currentUserId) throw new Error('Unauthorized');
    const meetupId = pathname.split('/')[pathname.split('/').length - 2];
    const meetups = getStorage(MEETUP_STORAGE_KEY, []);
    const meetup = meetups.find((m: any) => m.id === meetupId);
    if (meetup) {
      meetup.members = meetup.members.filter((m: any) => m.user.id !== 'current-user');
      meetup._count.members = meetup.members.length;
      setStorage(MEETUP_STORAGE_KEY, meetups);
    }
    return {
      success: true,
      data: meetup,
    } as T;
  }

  // Venues endpoints
  if (pathname.includes('/venues')) {
    const venues = getStorage(VENUE_STORAGE_KEY, []);

    if (method === 'GET') {
      const venueId = pathname.split('/').pop();
      if (venueId && venueId !== 'venues' && venueId !== 'nearby') {
        const venue = venues.find((v: any) => v.id === venueId);
        if (!venue) throw new Error('Venue not found');
        return {
          success: true,
          data: venue,
        } as T;
      }
      let filtered = [...venues];
      if (searchParams.get('search')) {
        const search = searchParams.get('search')!.toLowerCase();
        filtered = filtered.filter((v: any) => 
          v.name.toLowerCase().includes(search) || 
          v.address?.toLowerCase().includes(search)
        );
      }
      return {
        success: true,
        data: filtered,
      } as T;
    }

    if (method === 'POST') {
      if (!currentUserId) throw new Error('Unauthorized');
      const newVenue = {
        id: generateId(),
        ...body,
        createdAt: new Date().toISOString(),
      };
      venues.push(newVenue);
      setStorage(VENUE_STORAGE_KEY, venues);
      return {
        success: true,
        data: newVenue,
      } as T;
    }
  }

  // Chats endpoints
  if (pathname.includes('/chats')) {
    const chats = getStorage(CHAT_STORAGE_KEY, []);
    const messages = getStorage(MESSAGE_STORAGE_KEY, []);

    if (pathname.includes('/direct') && method === 'POST') {
      if (!currentUserId) throw new Error('Unauthorized');
      const existingChat = chats.find((c: any) => 
        c.type === 'direct' && 
        c.members.some((m: any) => m.user.id === body.userId) &&
        c.members.some((m: any) => m.user.id === 'current-user')
      );
      if (existingChat) {
        return {
          success: true,
          data: existingChat,
        } as T;
      }
      const user = getDummyUser(body.userId);
      const newChat = {
        id: generateId(),
        type: 'direct' as const,
        members: [
          { id: generateId(), user: getStorage(`${USER_STORAGE_KEY}_current-user`, getDummyUser('current-user')) },
          { id: generateId(), user },
        ],
        updatedAt: new Date().toISOString(),
        _count: { messages: 0 },
      };
      chats.push(newChat);
      setStorage(CHAT_STORAGE_KEY, chats);
      return {
        success: true,
        data: newChat,
      } as T;
    }

    if (method === 'GET' && !pathname.includes('/messages')) {
      if (!currentUserId) throw new Error('Unauthorized');
      const chatId = pathname.split('/').pop();
      if (chatId && chatId !== 'chats') {
        const chat = chats.find((c: any) => c.id === chatId);
        if (!chat) throw new Error('Chat not found');
        return {
          success: true,
          data: chat,
        } as T;
      }
      return {
        success: true,
        data: chats,
      } as T;
    }

    if (pathname.includes('/messages')) {
      if (!currentUserId) throw new Error('Unauthorized');
      const chatId = pathname.split('/')[pathname.split('/').length - 2];
      
      if (method === 'GET') {
        const chatMessages = messages.filter((m: any) => m.chatId === chatId);
        return {
          success: true,
          data: chatMessages,
        } as T;
      }

      if (method === 'POST') {
        const user = getStorage(`${USER_STORAGE_KEY}_current-user`, getDummyUser('current-user'));
        const newMessage = {
          id: generateId(),
          content: body.content,
          senderId: 'current-user',
          chatId,
          read: false,
          createdAt: new Date().toISOString(),
          sender: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            avatar: user.avatar,
          },
        };
        messages.push(newMessage);
        setStorage(MESSAGE_STORAGE_KEY, messages);
        
        // Update chat updatedAt
        const chat = chats.find((c: any) => c.id === chatId);
        if (chat) {
          chat.updatedAt = new Date().toISOString();
          chat._count.messages = (chat._count.messages || 0) + 1;
          setStorage(CHAT_STORAGE_KEY, chats);
        }
        
        return {
          success: true,
          data: newMessage,
        } as T;
      }
    }
  }

  // Posts endpoints
  if (pathname.includes('/posts')) {
    const posts = getStorage(POST_STORAGE_KEY, []);

    if (method === 'GET') {
      return {
        success: true,
        data: posts,
      } as T;
    }

    if (method === 'POST') {
      if (!currentUserId) throw new Error('Unauthorized');
      const user = getStorage(`${USER_STORAGE_KEY}_current-user`, getDummyUser('current-user'));
      const newPost = {
        id: generateId(),
        ...body,
        creator: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          avatar: user.avatar,
        },
        likes: 0,
        comments: [],
        createdAt: new Date().toISOString(),
      };
      posts.push(newPost);
      setStorage(POST_STORAGE_KEY, posts);
      return {
        success: true,
        data: newPost,
      } as T;
    }

    if (pathname.includes('/like')) {
      if (!currentUserId) throw new Error('Unauthorized');
      const postId = pathname.split('/')[pathname.split('/').length - 2];
      const post = posts.find((p: any) => p.id === postId);
      if (post) {
        post.likes = (post.likes || 0) + 1;
        setStorage(POST_STORAGE_KEY, posts);
      }
      return {
        success: true,
        message: 'Post liked',
        liked: true,
      } as T;
    }

    if (pathname.includes('/comment')) {
      if (!currentUserId) throw new Error('Unauthorized');
      const postId = pathname.split('/')[pathname.split('/').length - 2];
      const post = posts.find((p: any) => p.id === postId);
      if (post) {
        const user = getStorage(`${USER_STORAGE_KEY}_current-user`, getDummyUser('current-user'));
        const comment = {
          id: generateId(),
          content: body.content,
          creator: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            avatar: user.avatar,
          },
          createdAt: new Date().toISOString(),
        };
        post.comments = post.comments || [];
        post.comments.push(comment);
        setStorage(POST_STORAGE_KEY, posts);
        return {
          success: true,
          data: comment,
        } as T;
      }
    }

    if (pathname.includes('/comments')) {
      const postId = pathname.split('/')[pathname.split('/').length - 2];
      const post = posts.find((p: any) => p.id === postId);
      return {
        success: true,
        data: post?.comments || [],
      } as T;
    }
  }

  // Stories endpoints
  if (pathname.includes('/stories')) {
    const stories = getStorage(STORY_STORAGE_KEY, []);

    if (method === 'GET') {
      return {
        success: true,
        data: stories,
      } as T;
    }

    if (method === 'POST') {
      if (!currentUserId) throw new Error('Unauthorized');
      const user = getStorage(`${USER_STORAGE_KEY}_current-user`, getDummyUser('current-user'));
      const newStory = {
        id: generateId(),
        ...body,
        creator: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          avatar: user.avatar,
        },
        views: 0,
        createdAt: new Date().toISOString(),
      };
      stories.push(newStory);
      setStorage(STORY_STORAGE_KEY, stories);
      return {
        success: true,
        data: newStory,
      } as T;
    }
  }

  // Classes endpoints
  if (pathname.includes('/classes')) {
    const classes = getStorage(CLASS_STORAGE_KEY, []);

    if (method === 'GET') {
      const classId = pathname.split('/').pop();
      if (classId && classId !== 'classes' && classId !== 'nearby' && classId !== 'my-classes') {
        const cls = classes.find((c: any) => c.id === classId);
        if (!cls) throw new Error('Class not found');
        return {
          success: true,
          data: cls,
        } as T;
      }
      return {
        success: true,
        data: classes,
      } as T;
    }

    if (method === 'POST') {
      if (!currentUserId) throw new Error('Unauthorized');
      const newClass = {
        id: generateId(),
        ...body,
        createdAt: new Date().toISOString(),
      };
      classes.push(newClass);
      setStorage(CLASS_STORAGE_KEY, classes);
      return {
        success: true,
        data: newClass,
      } as T;
    }

    if (pathname.includes('/enroll')) {
      if (!currentUserId) throw new Error('Unauthorized');
      return {
        success: true,
        message: 'Enrolled successfully',
      } as T;
    }
  }

  // Notifications endpoints
  if (pathname.includes('/notifications')) {
    const notifications = getStorage(NOTIFICATION_STORAGE_KEY, []);

    if (method === 'GET') {
      return {
        success: true,
        data: notifications,
        unreadCount: notifications.filter((n: any) => !n.read).length,
      } as T;
    }

    if (pathname.includes('/read-all') && method === 'POST') {
      notifications.forEach((n: any) => { n.read = true; });
      setStorage(NOTIFICATION_STORAGE_KEY, notifications);
      return {
        success: true,
        message: 'All notifications marked as read',
      } as T;
    }

    if (pathname.includes('/read') && method === 'POST') {
      const notifId = pathname.split('/')[pathname.split('/').length - 2];
      const notif = notifications.find((n: any) => n.id === notifId);
      if (notif) {
        notif.read = true;
        setStorage(NOTIFICATION_STORAGE_KEY, notifications);
      }
      return {
        success: true,
        message: 'Notification marked as read',
      } as T;
    }
  }

  // Matches endpoints
  if (pathname.includes('/matches')) {
    const matches = getStorage(MATCH_STORAGE_KEY, []);

    if (method === 'GET') {
      return {
        success: true,
        data: matches,
      } as T;
    }

    if (method === 'POST') {
      if (!currentUserId) throw new Error('Unauthorized');
      const newMatch = {
        id: generateId(),
        ...body,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      matches.push(newMatch);
      setStorage(MATCH_STORAGE_KEY, matches);
      return {
        success: true,
        data: newMatch,
      } as T;
    }
  }

  // Suggestions endpoints
  if (pathname.includes('/suggestions')) {
    if (method === 'GET') {
      return {
        success: true,
        data: [],
      } as T;
    }

    if (method === 'POST') {
      return {
        success: true,
        message: 'Suggestion submitted',
      } as T;
    }
  }

  // Default fallback
  console.warn('Unhandled mock API endpoint:', pathname, method);
  return {
    success: true,
    data: null,
    message: 'Mock endpoint not implemented',
  } as T;
};

export const mockApiUpload = async <T = any>(
  url: string,
  file: File,
  additionalData?: Record<string, any>
): Promise<T> => {
  await delay(500);
  
  // Simulate file upload - return a dummy URL
  const fileUrl = URL.createObjectURL(file);
  
  // Handle avatar upload
  if (url.includes('/users/avatar')) {
    const currentUserId = localStorage.getItem('authToken') ? 'current-user' : null;
    if (!currentUserId) throw new Error('Unauthorized');
    
    const user = getStorage(`${USER_STORAGE_KEY}_current-user`, getDummyUser('current-user'));
    user.avatar = fileUrl;
    setStorage(`${USER_STORAGE_KEY}_current-user`, user);
    
    return {
      success: true,
      data: { avatar: fileUrl },
    } as T;
  }
  
  // Handle meetup image upload
  if (url.includes('/meetups')) {
    return {
      success: true,
      data: { image: fileUrl },
    } as T;
  }
  
  return {
    success: true,
    data: { url: fileUrl },
  } as T;
};
