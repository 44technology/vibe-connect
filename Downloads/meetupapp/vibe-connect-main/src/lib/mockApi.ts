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
const getDummyUser = (id: string, data?: any) => {
  // Default interests for users
  const defaultInterests = id === 'current-user' 
    ? ['coffee', 'tennis', 'yoga', 'music', 'travel', 'fitness']
    : ['coffee', 'fitness', 'music', 'art', 'travel'];
  
  // Default photos and videos for users
  const defaultPhotos = id === 'current-user' 
    ? [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
        'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      ]
    : id === 'user-1'
    ? [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
      ]
    : id === 'user-2'
    ? [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      ]
    : id === 'user-3'
    ? [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      ]
    : [];
  
  // Add some videos (using data:video prefix for ProfilePage detection)
  const defaultVideos = id === 'current-user'
    ? [
        'data:video;https://videos.unsplash.com/video-1522202176988-66273c2fd55f?w=400',
        'data:video;https://videos.unsplash.com/video-1535378629546-c9b8f0c8b5b1?w=400',
      ]
    : id === 'user-1'
    ? [
        'data:video;https://videos.unsplash.com/video-1522202176988-66273c2fd55f?w=400',
      ]
    : id === 'user-2'
    ? [
        'data:video;https://videos.unsplash.com/video-1522202176988-66273c2fd55f?w=400',
        'data:video;https://videos.unsplash.com/video-1535378629546-c9b8f0c8b5b1?w=400',
      ]
    : id === 'user-3'
    ? [
        'data:video;https://videos.unsplash.com/video-1522202176988-66273c2fd55f?w=400',
      ]
    : [];
  
  // Combine photos and videos
  const allMedia = [...(data?.photos || defaultPhotos), ...defaultVideos];
  
  return {
    id,
    firstName: data?.firstName || 'John',
    lastName: data?.lastName || 'Doe',
    displayName: data?.displayName || `${data?.firstName || 'John'} ${data?.lastName || 'Doe'}`,
    email: data?.email || `user${id}@example.com`,
    phone: data?.phone || '+1234567890',
    avatar: data?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    bio: data?.bio || 'New to the app!',
    photos: allMedia.length > 0 ? allMedia : (data?.photos || []),
    interests: data?.interests || defaultInterests,
    lookingFor: data?.lookingFor || ['friendship', 'networking'],
    isVerified: true,
    createdAt: new Date().toISOString(),
  };
};

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
      {
        id: '3',
        title: 'Sunset Yoga at Bayfront Park',
        description: 'Join us for a relaxing sunset yoga session with beautiful views',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
        status: 'UPCOMING' as const,
        maxAttendees: 25,
        category: 'Wellness',
        tags: ['yoga', 'wellness', 'outdoor'],
        latitude: 25.7753,
        longitude: -80.1889,
        creator: {
          id: 'user-4',
          firstName: 'Emma',
          lastName: 'Wilson',
          displayName: 'Emma W.',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        },
        venue: {
          id: 'venue-3',
          name: 'Bayfront Park',
          address: '301 Biscayne Blvd, Miami',
          city: 'Miami',
          latitude: 25.7753,
          longitude: -80.1889,
        },
        members: [],
        _count: { members: 0 },
      },
      {
        id: '4',
        title: 'Salsa Night at La Bodeguita',
        description: 'Learn salsa dancing and enjoy Cuban music',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
        startTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING' as const,
        maxAttendees: 30,
        category: 'Dancing',
        tags: ['dancing', 'salsa', 'music', 'nightlife'],
        latitude: 25.7617,
        longitude: -80.1918,
        creator: {
          id: 'user-5',
          firstName: 'Maria',
          lastName: 'Garcia',
          displayName: 'Maria G.',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        },
        venue: {
          id: 'venue-4',
          name: 'La Bodeguita',
          address: '1620 Collins Ave, Miami Beach',
          city: 'Miami Beach',
          latitude: 25.7617,
          longitude: -80.1918,
        },
        members: [],
        _count: { members: 0 },
      },
      {
        id: '5',
        title: 'Beach Volleyball Tournament',
        description: 'Join our friendly beach volleyball tournament',
        image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING' as const,
        maxAttendees: 16,
        category: 'Sports',
        tags: ['volleyball', 'beach', 'sports', 'competition'],
        latitude: 25.7907,
        longitude: -80.1300,
        creator: {
          id: 'user-6',
          firstName: 'David',
          lastName: 'Brown',
          displayName: 'David B.',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        },
        venue: {
          id: 'venue-5',
          name: 'South Beach',
          address: 'South Beach, Miami Beach',
          city: 'Miami Beach',
          latitude: 25.7907,
          longitude: -80.1300,
        },
        members: [],
        _count: { members: 0 },
      },
      {
        id: 'surprise-1',
        title: 'Mystery Adventure',
        description: 'Join us for a surprise adventure! Location and details will be revealed 2 hours before.',
        image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400',
        startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING' as const,
        maxAttendees: 8,
        category: 'Adventure',
        tags: ['surprise', 'adventure', 'mystery'],
        latitude: 25.7617,
        longitude: -80.1918,
        isBlindMeet: true,
        creator: {
          id: 'user-3',
          firstName: 'Mystery',
          lastName: 'Host',
          displayName: 'Mystery Host',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        },
        venue: {
          id: 'venue-surprise',
          name: 'Secret Location',
          address: 'Will be revealed 2 hours before',
          city: 'Miami',
          latitude: 25.7617,
          longitude: -80.1918,
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

  // Initialize classes if empty
  let classes = getStorage(CLASS_STORAGE_KEY, []);
  if (classes.length === 0) {
    const dummyClasses = [
      {
        id: 'class-1',
        title: 'Yoga Flow for Beginners',
        description: 'A gentle introduction to yoga with focus on breathing and basic poses. Perfect for those new to yoga or looking to refresh their practice.',
        skill: 'Yoga',
        category: 'Wellness',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING',
        maxStudents: 15,
        price: 50,
        schedule: 'Every Saturday 10am-11am',
        venue: {
          id: 'venue-1',
          name: 'Panther Coffee',
          address: '2390 NW 2nd Ave, Miami',
          city: 'Miami',
          image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
        },
        enrollments: [],
        _count: { enrollments: 0 },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'class-2',
        title: 'Tennis Fundamentals',
        description: 'Learn the basics of tennis including proper grip, stance, and basic strokes. Suitable for beginners.',
        skill: 'Tennis',
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
        status: 'UPCOMING',
        maxStudents: 8,
        price: 50,
        schedule: 'Every Sunday 2pm-3:30pm',
        venue: {
          id: 'venue-2',
          name: 'Flamingo Park Tennis',
          address: '1200 Jefferson Ave, Miami Beach',
          city: 'Miami Beach',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        },
        enrollments: [],
        _count: { enrollments: 0 },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'class-3',
        title: 'Salsa Dancing Basics',
        description: 'Learn the fundamentals of salsa dancing in a fun and social environment. No partner needed!',
        skill: 'Dancing',
        category: 'Arts',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
        status: 'UPCOMING',
        maxStudents: 20,
        price: 50,
        schedule: 'Every Friday 7pm-8:30pm',
        venue: {
          id: 'venue-1',
          name: 'Panther Coffee',
          address: '2390 NW 2nd Ave, Miami',
          city: 'Miami',
          image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
        },
        enrollments: [],
        _count: { enrollments: 0 },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'class-4',
        title: 'Public Speaking & Diction Mastery',
        description: 'Master the art of public speaking and improve your diction. Build confidence and clarity in your communication skills.',
        skill: 'Public Speaking',
        category: 'Professional Development',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        startTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
        status: 'UPCOMING',
        maxStudents: 12,
        price: 75,
        schedule: 'Every Tuesday 6pm-7:30pm',
        venue: null,
        latitude: null,
        longitude: null,
        enrollments: [],
        _count: { enrollments: 0 },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'class-5',
        title: 'Acting & Audition Preparation',
        description: 'Prepare for auditions and improve your acting skills. Learn monologue delivery, character development, and audition techniques.',
        skill: 'Acting',
        category: 'Arts',
        image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800',
        startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
        status: 'UPCOMING',
        maxStudents: 10,
        price: 80,
        schedule: 'Every Wednesday 7pm-9pm',
        venue: {
          id: 'venue-3',
          name: 'Miami Theater Studio',
          address: '1234 Collins Ave, Miami Beach',
          city: 'Miami Beach',
          image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=400',
        },
        enrollments: [],
        _count: { enrollments: 0 },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'class-6',
        title: 'Pilates Core Strength',
        description: 'Build core strength and improve flexibility with Pilates. Suitable for all fitness levels.',
        skill: 'Pilates',
        category: 'Fitness',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING',
        maxStudents: 15,
        price: 45,
        schedule: 'Every Monday & Thursday 9am-10am',
        venue: {
          id: 'venue-4',
          name: 'Equinox South Beach',
          address: '1755 Collins Ave, Miami Beach',
          city: 'Miami Beach',
          image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
        },
        enrollments: [],
        _count: { enrollments: 0 },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'class-7',
        title: 'French Pastry & Baking Workshop',
        description: 'Learn the art of French pastry making. Master croissants, éclairs, macarons, and more in this hands-on baking class.',
        skill: 'Baking',
        category: 'Culinary',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 180 * 60 * 1000).toISOString(),
        status: 'UPCOMING',
        maxStudents: 8,
        price: 95,
        schedule: 'Every Saturday 2pm-5pm',
        venue: {
          id: 'venue-5',
          name: 'Miami Culinary Institute',
          address: '415 NE 2nd Ave, Miami',
          city: 'Miami',
          image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
        },
        enrollments: [],
        _count: { enrollments: 0 },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'class-8',
        title: 'Vinyasa Flow Yoga',
        description: 'Dynamic yoga flow combining movement and breath. Perfect for building strength and flexibility.',
        skill: 'Yoga',
        category: 'Wellness',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000).toISOString(),
        status: 'UPCOMING',
        maxStudents: 20,
        price: 40,
        schedule: 'Every Sunday 8am-9:15am',
        venue: null,
        latitude: null,
        longitude: null,
        enrollments: [],
        _count: { enrollments: 0 },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'class-9',
        title: 'Advanced Pilates Mat',
        description: 'Take your Pilates practice to the next level with advanced mat exercises and techniques.',
        skill: 'Pilates',
        category: 'Fitness',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
        startTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING',
        maxStudents: 12,
        price: 50,
        schedule: 'Every Friday 6pm-7pm',
        venue: {
          id: 'venue-4',
          name: 'Equinox South Beach',
          address: '1755 Collins Ave, Miami Beach',
          city: 'Miami Beach',
          image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
        },
        enrollments: [],
        _count: { enrollments: 0 },
        createdAt: new Date().toISOString(),
      },
    ];
    setStorage(CLASS_STORAGE_KEY, dummyClasses);
  } else {
    // Update existing classes to have $50 price if they don't have one or are free
    classes = classes.map((c: any) => ({
      ...c,
      price: c.price === 0 || c.price === undefined || c.price === null ? 50 : c.price,
    }));
    setStorage(CLASS_STORAGE_KEY, classes);
  }

  // Initialize posts with common interests (users already created in matches section)
  const posts = getStorage(POST_STORAGE_KEY, []);
  if (posts.length === 0) {
    // Get users that were created in matches section (they have common interests)
    const user1 = getStorage(`${USER_STORAGE_KEY}_user-1`, getDummyUser('user-1', {
      firstName: 'Sarah',
      lastName: 'Miller',
      displayName: 'Sarah M.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      interests: ['coffee', 'yoga', 'music', 'travel', 'fitness'], // Common with current-user: coffee, yoga, music, travel, fitness (5)
    }));
    const user2 = getStorage(`${USER_STORAGE_KEY}_user-2`, getDummyUser('user-2', {
      firstName: 'James',
      lastName: 'Keller',
      displayName: 'James K.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      interests: ['tennis', 'fitness', 'coffee', 'networking'], // Common with current-user: tennis, fitness, coffee (3)
    }));
    const user3 = getStorage(`${USER_STORAGE_KEY}_user-3`, getDummyUser('user-3', {
      firstName: 'Emma',
      lastName: 'Wilson',
      displayName: 'Emma W.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      interests: ['art', 'music', 'travel', 'foodie'], // Common with current-user: music, travel (2)
    }));

    const dummyPosts = [
      {
        id: 'post-1',
        userId: user1.id, // Store userId for privacy checks
        content: 'Amazing yoga session this morning! 🧘✨',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        user: {
          id: user1.id,
          firstName: user1.firstName,
          lastName: user1.lastName,
          displayName: user1.displayName,
          avatar: user1.avatar,
          interests: user1.interests,
        },
        venue: null,
        likes: 0,
        comments: [],
        commentsCount: 0,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        _count: { likes: 142, comments: 23 },
      },
      {
        id: 'post-2',
        userId: user2.id,
        content: 'Great tennis match today! 🎾',
        image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800',
        user: {
          id: user2.id,
          firstName: user2.firstName,
          lastName: user2.lastName,
          displayName: user2.displayName,
          avatar: user2.avatar,
          interests: user2.interests,
        },
        venue: null,
        likes: 0,
        comments: [],
        commentsCount: 0,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        _count: { likes: 89, comments: 12 },
      },
      {
        id: 'post-3',
        userId: user3.id,
        content: 'Beautiful sunset from my travel! ✈️🌅',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        user: {
          id: user3.id,
          firstName: user3.firstName,
          lastName: user3.lastName,
          displayName: user3.displayName,
          avatar: user3.avatar,
          interests: user3.interests,
        },
        venue: null,
        likes: 0,
        comments: [],
        commentsCount: 0,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        _count: { likes: 67, comments: 8 },
      },
      {
        id: 'post-4',
        userId: user1.id,
        content: 'Coffee and good vibes! ☕',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
        user: {
          id: user1.id,
          firstName: user1.firstName,
          lastName: user1.lastName,
          displayName: user1.displayName,
          avatar: user1.avatar,
          interests: user1.interests,
        },
        venue: null,
        likes: 0,
        comments: [],
        commentsCount: 0,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        _count: { likes: 156, comments: 34 },
      },
    ];
    setStorage(POST_STORAGE_KEY, dummyPosts);
  }

  // Initialize stories if empty
  const stories = getStorage(STORY_STORAGE_KEY, []);
  if (stories.length === 0) {
    const dummyStories = [
      {
        id: 'story-1',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
        userId: 'user-1',
        user: {
          id: 'user-1',
          firstName: 'Sarah',
          lastName: 'Miller',
          displayName: 'Sarah',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        views: 0,
      },
      {
        id: 'story-2',
        image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800',
        userId: 'user-2',
        user: {
          id: 'user-2',
          firstName: 'Mike',
          lastName: 'Chen',
          displayName: 'Mike',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        },
        expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        views: 0,
      },
      {
        id: 'story-3',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
        userId: 'user-3',
        user: {
          id: 'user-3',
          firstName: 'Emma',
          lastName: 'Williams',
          displayName: 'Emma',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        },
        expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        views: 0,
      },
      {
        id: 'story-4',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
        userId: 'user-4',
        user: {
          id: 'user-4',
          firstName: 'David',
          lastName: 'Brown',
          displayName: 'David',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        },
        expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        views: 0,
      },
      {
        id: 'story-5',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
        userId: 'user-5',
        user: {
          id: 'user-5',
          firstName: 'Lisa',
          lastName: 'Anderson',
          displayName: 'Lisa',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        },
        expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        views: 0,
      },
      {
        id: 'story-6',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
        userId: 'user-6',
        user: {
          id: 'user-6',
          firstName: 'James',
          lastName: 'Wilson',
          displayName: 'James',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        },
        expiresAt: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        views: 0,
      },
    ];
    setStorage(STORY_STORAGE_KEY, dummyStories);
  }

  // Initialize matches (connections) if empty
  const matches = getStorage(MATCH_STORAGE_KEY, []);
  if (matches.length === 0) {
    // Create users with common interests (for LifePage star indicators)
    // Current-user interests: ['coffee', 'tennis', 'yoga', 'music', 'travel', 'fitness']
    const user1 = getDummyUser('user-1', {
      firstName: 'Sarah',
      lastName: 'Miller',
      displayName: 'Sarah M.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      interests: ['coffee', 'yoga', 'music', 'travel', 'fitness'], // Common: coffee, yoga, music, travel, fitness (5)
    });
    const user2 = getDummyUser('user-2', {
      firstName: 'James',
      lastName: 'Keller',
      displayName: 'James K.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      interests: ['tennis', 'fitness', 'coffee', 'networking'], // Common: tennis, fitness, coffee (3)
    });
    const user3 = getDummyUser('user-3', {
      firstName: 'Emma',
      lastName: 'Wilson',
      displayName: 'Emma W.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      interests: ['art', 'music', 'travel', 'foodie'], // Common: music, travel (2)
    });
    
    setStorage(`${USER_STORAGE_KEY}_user-1`, user1);
    setStorage(`${USER_STORAGE_KEY}_user-2`, user2);
    setStorage(`${USER_STORAGE_KEY}_user-3`, user3);

    const dummyMatches = [
      {
        id: 'match-1',
        status: 'ACCEPTED' as const,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: user1.id,
          firstName: user1.firstName,
          lastName: user1.lastName,
          displayName: user1.displayName,
          avatar: user1.avatar,
          bio: user1.bio,
        },
        isSender: false,
      },
      {
        id: 'match-2',
        status: 'ACCEPTED' as const,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: user2.id,
          firstName: user2.firstName,
          lastName: user2.lastName,
          displayName: user2.displayName,
          avatar: user2.avatar,
          bio: user2.bio,
        },
        isSender: true,
      },
      {
        id: 'match-3',
        status: 'PENDING' as const,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: user3.id,
          firstName: user3.firstName,
          lastName: user3.lastName,
          displayName: user3.displayName,
          avatar: user3.avatar,
          bio: user3.bio,
        },
        isSender: true,
      },
    ];
    setStorage(MATCH_STORAGE_KEY, dummyMatches);
  }

  // Initialize current-user with default interests and photos if not exists
  const currentUser = getStorage(`${USER_STORAGE_KEY}_current-user`, null);
  if (currentUser) {
    let updated = false;
    if (!currentUser.interests || currentUser.interests.length === 0) {
      currentUser.interests = ['coffee', 'tennis', 'yoga', 'music', 'travel', 'fitness'];
      updated = true;
    }
    if (!currentUser.photos || currentUser.photos.length === 0) {
      const defaultPhotos = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
        'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      ];
      const defaultVideos = [
        'data:video;https://videos.unsplash.com/video-1522202176988-66273c2fd55f?w=400',
        'data:video;https://videos.unsplash.com/video-1535378629546-c9b8f0c8b5b1?w=400',
      ];
      currentUser.photos = [...defaultPhotos, ...defaultVideos];
      updated = true;
    }
    if (updated) {
      setStorage(`${USER_STORAGE_KEY}_current-user`, currentUser);
    }
  }

  // Add current-user to some meetups (My Vibes)
  const allMeetups = getStorage(MEETUP_STORAGE_KEY, []);
  const currentUserId = 'current-user';
  const currentUserData = getStorage(`${USER_STORAGE_KEY}_current-user`, getDummyUser(currentUserId));
  
  // Create additional meetups for current-user
  const userMeetup1 = {
    id: 'user-meetup-1',
    title: 'Morning Yoga Session',
    description: 'Start your day with a peaceful yoga session',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
    status: 'UPCOMING' as const,
    maxAttendees: 15,
    category: 'Wellness',
    tags: ['yoga', 'wellness', 'morning'],
    latitude: 25.7617,
    longitude: -80.1918,
    creator: {
      id: currentUserData.id,
      firstName: currentUserData.firstName,
      lastName: currentUserData.lastName,
      displayName: currentUserData.displayName,
      avatar: currentUserData.avatar,
    },
    venue: {
      id: 'venue-3',
      name: 'Bayfront Park',
      address: '301 Biscayne Blvd, Miami',
      city: 'Miami',
      latitude: 25.7753,
      longitude: -80.1889,
    },
    members: [],
    _count: { members: 0 },
  };

  const userMeetup2 = {
    id: 'user-meetup-2',
    title: 'Coffee & Networking',
    description: 'Meet like-minded professionals over coffee',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    status: 'UPCOMING' as const,
    maxAttendees: 8,
    category: 'Networking',
    tags: ['coffee', 'networking', 'business'],
    latitude: 25.7617,
    longitude: -80.1918,
    creator: {
      id: currentUserData.id,
      firstName: currentUserData.firstName,
      lastName: currentUserData.lastName,
      displayName: currentUserData.displayName,
      avatar: currentUserData.avatar,
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
  };

  const pastMeetup = {
    id: 'user-meetup-past',
    title: 'Beach Volleyball',
    description: 'Fun volleyball game at the beach',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
    startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    status: 'COMPLETED' as const,
    maxAttendees: 12,
    category: 'Sports',
    tags: ['volleyball', 'beach', 'sports'],
    latitude: 25.7907,
    longitude: -80.1300,
    creator: {
      id: currentUserData.id,
      firstName: currentUserData.firstName,
      lastName: currentUserData.lastName,
      displayName: currentUserData.displayName,
      avatar: currentUserData.avatar,
    },
    venue: {
      id: 'venue-4',
      name: 'South Beach',
      address: 'South Beach, Miami Beach',
      city: 'Miami Beach',
      latitude: 25.7907,
      longitude: -80.1300,
    },
    members: [],
    _count: { members: 0 },
  };

  // Add user meetups if they don't exist
  const existingIds = allMeetups.map((m: any) => m.id);
  if (!existingIds.includes('user-meetup-1')) allMeetups.push(userMeetup1);
  if (!existingIds.includes('user-meetup-2')) allMeetups.push(userMeetup2);
  if (!existingIds.includes('user-meetup-past')) allMeetups.push(pastMeetup);

  // Add current-user as member to first meetup
  allMeetups.forEach((meetup: any) => {
    if (meetup.id === '1' && !meetup.members.find((m: any) => m.user?.id === currentUserId)) {
      meetup.members.push({
        id: generateId(),
        user: {
          id: currentUserData.id,
          firstName: currentUserData.firstName,
          lastName: currentUserData.lastName,
          displayName: currentUserData.displayName,
          avatar: currentUserData.avatar,
        },
        status: 'going',
      });
      meetup._count.members = meetup.members.length;
    }
  });
  
  setStorage(MEETUP_STORAGE_KEY, allMeetups);
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
    const user = getDummyUser(userId, {
      ...body,
      interests: body.interests || ['coffee', 'tennis', 'yoga', 'music', 'travel', 'fitness'],
    });
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
        lastName: 'Name',
        interests: ['coffee', 'tennis', 'yoga', 'music', 'travel', 'fitness'],
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
    const secondLastPart = pathParts[pathParts.length - 2];
    
    // Check if it's /users/stats or /users/stats/:userId
    if (lastPart === 'stats' || (secondLastPart === 'stats' && lastPart)) {
      const targetUserId = lastPart === 'stats' ? currentUserId : lastPart;
      
      if (!targetUserId) throw new Error('User ID is required');
      
      // Calculate real stats from storage for the target user
      const matches = getStorage(MATCH_STORAGE_KEY, []);
      
      // Count accepted matches for the target user
      let connectionsCount = 0;
      if (targetUserId === currentUserId) {
        // Count all accepted matches for current user
        connectionsCount = matches.filter((m: any) => m.status === 'ACCEPTED').length;
      } else {
        // For other users, we need to simulate their connections count
        // In mock mode, we'll return a dummy count based on user ID for consistency
        // Check if there's a match between current user and target user
        const matchWithTarget = matches.find((m: any) => 
          m.user?.id === targetUserId && m.status === 'ACCEPTED'
        );
        
        // Generate consistent dummy count based on userId hash
        const userIdHash = targetUserId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const dummyCount = (userIdHash % 10) + 5; // Between 5-14
        
        // If there's a match with current user, include it
        connectionsCount = matchWithTarget ? dummyCount + 1 : dummyCount;
      }
      
      const meetups = getStorage(MEETUP_STORAGE_KEY, []);
      const userMeetups = meetups.filter((m: any) => {
        // Check if user is creator
        if (m.creator?.id === targetUserId) return true;
        // Check if user is a member
        if (m.members?.some((mem: any) => mem.user?.id === targetUserId)) return true;
        return false;
      });
      
      return {
        success: true,
        data: {
          connections: connectionsCount,
          meetups: userMeetups.length,
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
    
    // Handle GET request (fetch avatar)
    if (method === 'GET') {
      const user = getStorage(`${USER_STORAGE_KEY}_current-user`, getDummyUser('current-user'));
      return {
        success: true,
        data: { avatar: user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
      } as T;
    }
    
    // Handle POST request (upload avatar)
    if (method === 'POST') {
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

  // Join meetup endpoint
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
      // Ensure posts have user.interests for common interests calculation
      const postsWithInterests = posts.map((p: any) => {
        if (p.user && !p.user.interests) {
          const postUser = getStorage(`${USER_STORAGE_KEY}_${p.user.id}`, null);
          if (postUser) {
            p.user.interests = postUser.interests || [];
          }
        }
        return p;
      });
      return {
        success: true,
        data: postsWithInterests,
      } as T;
    }

    if (method === 'POST') {
      if (!currentUserId) throw new Error('Unauthorized');
      const user = getStorage(`${USER_STORAGE_KEY}_current-user`, getDummyUser('current-user'));
      const newPost = {
        id: generateId(),
        ...body,
        userId: user.id, // Store userId for privacy checks (like/comment notifications)
        creator: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          avatar: user.avatar,
        },
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          avatar: user.avatar,
          interests: user.interests || [],
        },
        likes: 0,
        comments: [],
        commentsCount: 0,
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
        const currentUser = getStorage(`${USER_STORAGE_KEY}_current-user`, getDummyUser('current-user'));
        const postOwnerId = post.userId || post.user?.id || post.creator?.id;
        
        // Increment like count
        post.likes = (post.likes || 0) + 1;
        setStorage(POST_STORAGE_KEY, posts);
        
        // Send notification to post owner (only if not liking own post)
        if (postOwnerId && postOwnerId !== currentUserId) {
          const notifications = getStorage(NOTIFICATION_STORAGE_KEY, []);
          const notification = {
            id: generateId(),
            type: 'POST_LIKE',
            title: 'New like on your post',
            message: `${currentUser.displayName || `${currentUser.firstName} ${currentUser.lastName}`} liked your post`,
            userId: postOwnerId,
            postId: postId,
            read: false,
            createdAt: new Date().toISOString(),
          };
          notifications.push(notification);
          setStorage(NOTIFICATION_STORAGE_KEY, notifications);
        }
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
      const postOwnerId = post?.userId || post?.user?.id || post?.creator?.id;
      
      // Only post owner can see who commented (WhatsApp status style)
      // Others see anonymous comments
      let comments = post?.comments || [];
      if (postOwnerId !== currentUserId) {
        // Hide user info for non-owners
        comments = comments.map((comment: any) => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          user: {
            id: 'anonymous',
            firstName: 'Anonymous',
            lastName: '',
            displayName: 'Anonymous',
            avatar: undefined,
          },
        }));
      } else {
        // Post owner sees full user info
        comments = comments.map((comment: any) => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          user: comment.creator || comment.user || {
            id: comment.userId || 'unknown',
            firstName: 'Unknown',
            lastName: '',
            displayName: 'Unknown',
            avatar: undefined,
          },
        }));
      }
      
      return {
        success: true,
        data: comments,
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
