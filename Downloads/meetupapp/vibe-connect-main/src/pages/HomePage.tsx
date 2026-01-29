import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Plus, Calendar, Clock, MapPin, ArrowRight, GraduationCap, DollarSign } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import { meetups as mockMeetups, venues as mockVenues } from '@/data/mockData';
import { useNotifications } from '@/hooks/useNotifications';
import { useMeetups } from '@/hooks/useMeetups';
import { useVenues } from '@/hooks/useVenues';
import { useStories } from '@/hooks/useStories';
import { useClasses } from '@/hooks/useClasses';
import { useAuth } from '@/contexts/AuthContext';
import VenueCard from '@/components/cards/VenueCard';
import ClassCard from '@/components/cards/ClassCard';
import UserAvatar from '@/components/ui/UserAvatar';
import CreateStoryModal from '@/components/CreateStoryModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [discoverTab, setDiscoverTab] = useState<'vibes' | 'venues'>('vibes');
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    distance: '',
    priceRange: '',
    rating: '',
  });
  
  // Fetch stories
  const { data: storiesData } = useStories();

  // Mock stories for display (if API doesn't return enough)
  const mockStories = [
    {
      id: 'mock-1',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
      user: {
        id: 'user-1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        displayName: 'Sarah',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-2',
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800',
      user: {
        id: 'user-2',
        firstName: 'Mike',
        lastName: 'Chen',
        displayName: 'Mike',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
      expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-3',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      user: {
        id: 'user-3',
        firstName: 'Emma',
        lastName: 'Williams',
        displayName: 'Emma',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      },
      expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-4',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
      user: {
        id: 'user-4',
        firstName: 'David',
        lastName: 'Brown',
        displayName: 'David',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      },
      expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-5',
      user: {
        id: 'user-5',
        firstName: 'Lisa',
        lastName: 'Anderson',
        displayName: 'Lisa',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      },
      expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-6',
      user: {
        id: 'user-6',
        firstName: 'James',
        lastName: 'Wilson',
        displayName: 'James',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      },
      expiresAt: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-7',
      user: {
        id: 'user-7',
        firstName: 'Sophia',
        lastName: 'Martinez',
        displayName: 'Sophia',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Combine API stories with mock stories
  const allStories = useMemo(() => {
    const apiStories = storiesData || [];
    // Filter out user's own stories from API
    const otherStories = apiStories.filter((s: any) => s.user?.id !== user?.id);
    // Combine with mock stories, avoiding duplicates
    const mockStoryIds = new Set(mockStories.map(s => s.id));
    const uniqueMockStories = mockStories.filter(s => !apiStories.some((as: any) => as.id === s.id));
    return [...otherStories, ...uniqueMockStories];
  }, [storiesData, user?.id]);
  
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications(isAuthenticated);

  // Convert distance filter to radius in miles
  const radius = filters.distance ? parseFloat(filters.distance) * 1.60934 : undefined; // Convert miles to km

  // Get user location (mock for now, should use geolocation API)
  const userLat = 25.7617; // Miami coordinates
  const userLon = -80.1918;

  // Fetch meetups with filters
  const { data: meetupsData, isLoading: meetupsLoading } = useMeetups({
    category: filters.category || undefined,
    search: searchQuery || undefined,
    isFree: filters.priceRange === 'free' ? true : undefined,
    latitude: filters.distance ? userLat : undefined,
    longitude: filters.distance ? userLon : undefined,
    radius: radius,
  });

  // Fetch venues with filters
  const { data: venuesData, isLoading: venuesLoading } = useVenues({
    search: searchQuery || undefined,
    latitude: filters.distance ? userLat : undefined,
    longitude: filters.distance ? userLon : undefined,
    radius: radius,
  });

  // Fetch user's enrolled classes
  const { data: userClasses } = useClasses(undefined, undefined, undefined, undefined, true);
  
  // Fetch all classes for display
  const { data: allClassesData, isLoading: allClassesLoading } = useClasses();
  
  // Get enrolled class IDs
  const enrolledClassIds = useMemo(() => {
    if (!userClasses) return new Set<string>();
    return new Set(userClasses.map((c: any) => c.id));
  }, [userClasses]);
  
  // Format classes for display
  const formattedClasses = useMemo(() => {
    if (!allClassesData || allClassesData.length === 0) return [];
    
    return allClassesData.slice(0, 6).map((c: any) => {
      const isEnrolled = enrolledClassIds.has(c.id);
      const userEnrollment = c.enrollments?.find((e: any) => e.user?.id === user?.id);
      const isPaid = isEnrolled && userEnrollment && (userEnrollment.status === 'paid' || userEnrollment.status === 'enrolled') && c.price && c.price > 0;
      
      return {
        id: c.id,
        title: c.title || `${c.category ? c.category.charAt(0).toUpperCase() + c.category.slice(1) : 'Class'} Course`,
        description: c.description || 'Join this class to learn and grow!',
        skill: c.skill || 'Class',
        category: c.category,
        image: c.image || 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400',
        startTime: c.startTime ? (typeof c.startTime === 'string' ? c.startTime : new Date(c.startTime).toISOString()) : new Date().toISOString(),
        endTime: c.endTime,
        price: c.price !== undefined && c.price !== null ? c.price : 0,
        schedule: c.schedule,
        venue: c.venue ? {
          id: c.venue.id || '',
          name: c.venue.name || 'Location TBD',
          address: c.venue.address || '',
          city: c.venue.city || '',
        } : {
          id: '',
          name: 'Location TBD',
          address: '',
          city: '',
        },
        _count: c._count || { enrollments: 0 },
        hasCertificate: (c as any).hasCertificate || false,
        isPremium: (c as any).isPremium || false,
        isExclusive: (c as any).isExclusive || false,
        maxStudents: (c as any).maxStudents,
        isEnrolled,
        isPaid,
      };
    });
  }, [allClassesData, enrolledClassIds, user?.id]);

  // Use API data if available, otherwise fall back to mock data
  const meetups = meetupsData && meetupsData.length > 0 ? meetupsData : mockMeetups;
  const venues = venuesData && venuesData.length > 0 ? venuesData : mockVenues;

  // Format date helper function
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'TBD';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Format time helper function
  const formatTime = (time: string | Date | undefined) => {
    if (!time) return 'TBD';
    const t = typeof time === 'string' ? new Date(time) : time;
    return t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Combine meetups and classes into "My Vibes & Classes"
  const myVibesAndClasses = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    
    // Get user's meetups (vibes)
    const userMeetups = meetups.filter((meetup: any) => {
      // Check if user is creator/host
      if (meetup.creator?.id === user.id || meetup.host?.id === user.id) return true;
      // Check if user is a member/attendee
      if (meetup.members?.some((m: any) => m.user?.id === user.id || m.id === user.id)) return true;
      return false;
    }).map((m: any) => ({ ...m, type: 'vibe' }));

    // Get user's enrolled classes
    const enrolledClasses = (userClasses || []).map((c: any) => ({ ...c, type: 'class' }));

    // Combine and sort by start time
    let combined = [...userMeetups, ...enrolledClasses].sort((a: any, b: any) => {
      const aTime = new Date(a.startTime || a.date || 0).getTime();
      const bTime = new Date(b.startTime || b.date || 0).getTime();
      return aTime - bTime;
    });

    // Always add example activities (surprise, diction class, bowling)
    const surpriseDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    surpriseDate.setHours(18, 0, 0, 0); // Set to 6:00 PM
    const classDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    classDate.setHours(19, 0, 0, 0); // Set to 7:00 PM
    const bowlingDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    bowlingDate.setHours(20, 0, 0, 0); // Set to 8:00 PM
    
    const exampleActivities = [
      // Surprise Activity (from dice) - Always show
      {
        id: 'surprise-example',
        title: 'Surprise Activity',
        type: 'vibe',
        isSurprise: true,
        isFromDice: true,
        startTime: surpriseDate.toISOString(),
        date: surpriseDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: surpriseDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        location: 'Secret Location',
        image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400',
        categoryEmoji: '🎲',
        creator: { id: 'dice', displayName: 'Dice Roll', firstName: 'Dice', lastName: 'Roll' },
      },
      // Diction Class
      {
        id: 'diction-class-example',
        title: 'Public Speaking & Diction Mastery',
        type: 'class',
        startTime: classDate.toISOString(),
        date: classDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: classDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        venue: { name: 'Online Class', address: 'Zoom Meeting' },
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
        instructor: { displayName: 'Sarah Johnson', firstName: 'Sarah', lastName: 'Johnson' },
        price: 99,
      },
      // Bowling Activity
      {
        id: 'bowling-vibe-example',
        title: 'Friday Night Bowling',
        type: 'vibe',
        startTime: bowlingDate.toISOString(),
        date: bowlingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: bowlingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        location: 'Lucky Strike Lanes, Miami',
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
        categoryEmoji: '🎳',
        creator: { id: 'user-example', displayName: 'Mike Chen', firstName: 'Mike', lastName: 'Chen' },
        members: [],
        _count: { members: 3 },
        maxAttendees: 8,
      },
    ];

    // Add example activities that aren't already in combined
    const existingIds = new Set(combined.map((a: any) => a.id));
    const newExamples = exampleActivities.filter((ex: any) => !existingIds.has(ex.id));
    
    // Ensure date and time are properly formatted strings for all examples
    const formattedExamples = newExamples.map((ex: any) => {
      // Always ensure date and time are set as formatted strings
      let formattedDate = ex.date;
      let formattedTime = ex.time;
      
      if (ex.startTime) {
        const dateObj = new Date(ex.startTime);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = formattedDate || dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          formattedTime = formattedTime || dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
      }
      
      return {
        ...ex,
        date: formattedDate || 'TBD',
        time: formattedTime || 'TBD',
      };
    });
    
    combined = [...combined, ...formattedExamples].sort((a: any, b: any) => {
      const aTime = new Date(a.startTime || a.date || 0).getTime();
      const bTime = new Date(b.startTime || b.date || 0).getTime();
      return aTime - bTime;
    });

    return combined;
  }, [meetups, userClasses, isAuthenticated, user]);

  const discoverMeetups = useMemo(() => {
    // Show all meetups except user's own activities
    if (!isAuthenticated || !user || myVibesAndClasses.length === 0) {
      // If not authenticated or no activities, show all meetups
      return meetups;
    }
    const myActivityIds = new Set(myVibesAndClasses.filter((a: any) => a.type === 'vibe').map((m: any) => m.id));
    return meetups.filter((meetup: any) => !myActivityIds.has(meetup.id));
  }, [meetups, myVibesAndClasses, isAuthenticated, user]);

  return (
    <MobileLayout>
      {/* Elegant Header */}
      <div className="sticky top-0 z-40 glass safe-top backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="px-4 py-4">
          {/* Purple dashed accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent border-t border-dashed border-primary/30" />
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Events</h1>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => navigate('/discover')}
                className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <Search className="w-5 h-5 text-foreground" />
              </motion.button>
              <motion.button
                onClick={() => navigate('/create')}
                className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <Plus className="w-5 h-5 text-foreground" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-8">
        {/* Stories Section */}
        <section>
          <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar pb-2">
            {/* Your Story - Add New */}
            <motion.div
              className="flex flex-col items-center gap-2 flex-shrink-0"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isAuthenticated) {
                  setShowCreateStoryModal(true);
                } else {
                  navigate('/login');
                }
              }}
            >
              <div className="relative">
                <div className="p-0.5 rounded-full bg-muted">
                  <div className="p-0.5 bg-background rounded-full">
                    <UserAvatar 
                      src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'} 
                      alt={user?.displayName || user?.firstName || 'You'} 
                      size="lg" 
                    />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow-lg">
                  <Plus className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-medium">Your Story</span>
            </motion.div>

            {/* Other Stories */}
            {allStories && allStories.length > 0 && allStories.slice(0, 15).map((story: any) => {
              const userName = story.user?.displayName || `${story.user?.firstName || ''} ${story.user?.lastName || ''}`.trim() || 'User';
              const hasStory = story.expiresAt && new Date(story.expiresAt) > new Date();
              
              return (
                <motion.div
                  key={story.id}
                  className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Navigate to story view (both real and mock stories)
                    navigate(`/story/${story.id}`);
                  }}
                >
                  <div className={`p-0.5 rounded-full ${hasStory ? 'bg-gradient-to-br from-primary to-secondary' : 'bg-muted'}`}>
                    <div className="p-0.5 bg-background rounded-full">
                      <UserAvatar 
                        src={story.user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'} 
                        alt={userName} 
                        size="lg" 
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground max-w-[60px] truncate">{userName}</span>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Expert-Led Classes Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Expert-Led Classes</h2>
              <p className="text-sm text-muted-foreground mt-1">Real entrepreneurs teaching real results. Connect through learning.</p>
            </div>
            <motion.button
              onClick={() => navigate('/classes')}
              className="text-primary text-sm font-medium flex items-center gap-1"
              whileTap={{ scale: 0.95 }}
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
          
          {/* Featured Classes - Card Format */}
          <div className="space-y-4">
            {allClassesLoading ? (
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 mx-auto mb-4 rounded-full border-4 border-primary/20 border-t-primary"
                />
                <p className="text-muted-foreground">Loading classes...</p>
              </div>
            ) : formattedClasses && formattedClasses.length > 0 ? (
              formattedClasses.map((classItem: any, index: number) => (
                <ClassCard
                  key={classItem.id}
                  {...classItem}
                  isEnrolled={classItem.isEnrolled}
                  isPopular={classItem.isPopular}
                  recentEnrollments={classItem.recentEnrollments}
                  onClick={() => navigate(`/class/${classItem.id}`)}
                  onEnroll={(e) => {
                    e?.stopPropagation();
                    if (classItem.isEnrolled) {
                      navigate(`/class/${classItem.id}`);
                    } else {
                      navigate(`/class/${classItem.id}`);
                    }
                  }}
                />
              ))
            ) : (
              <motion.button
                onClick={() => navigate('/classes')}
                className="w-full p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all group"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-foreground text-base">Explore Expert-Led Classes</h3>
                    <p className="text-xs text-muted-foreground">Connect through learning and shared progress</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </motion.button>
            )}
          </div>
        </section>

        {/* My Vibes & Classes Section */}
        {myVibesAndClasses.length > 0 && (
          <section>
            <motion.button
              onClick={() => navigate('/my-meetups')}
              className="flex items-center justify-between w-full mb-4 group"
            >
              <h2 className="text-xl font-bold text-foreground">My Vibes & Classes</h2>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.button>
            <div className="space-y-3">
              <AnimatePresence>
                {myVibesAndClasses.slice(0, 3).map((item: any, index: number) => {
                  const isClass = item.type === 'class';
                  const hostName = isClass 
                    ? (item.instructor?.displayName || item.venue?.name || 'Instructor')
                    : (item.host?.name || item.creator?.displayName || 
                        (item.creator ? `${item.creator.firstName} ${item.creator.lastName}` : 'You'));
                  const isYou = isAuthenticated && user && (
                    !isClass && (item.host?.id === user.id || item.creator?.id === user.id)
                  );
                  
                  return (
                    <motion.div
                      key={`${item.type}-${item.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(isClass ? `/class/${item.id}` : `/meetup/${item.id}`)}
                      className="flex gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <span className="text-2xl">{isClass ? '📚' : (item.categoryEmoji || '🎉')}</span>
                          </div>
                        )}
                        {isClass && (
                          <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary/90 flex items-center justify-center">
                            <GraduationCap className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {isClass && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              Class
                            </span>
                          )}
                          {(item.isSurprise || item.isFromDice) && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 text-yellow-600 dark:text-yellow-400 font-bold flex items-center gap-1">
                              <span>🎲</span>
                              <span>Surprise</span>
                            </span>
                          )}
                          <p className={`text-sm font-medium ${isYou ? 'text-primary' : 'text-primary'}`}>
                            {isYou ? 'You' : hostName}
                          </p>
                        </div>
                        <h3 className="text-base font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {item.date || (item.startTime ? formatDate(item.startTime) : 'TBD')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-[#FF8C00] font-semibold">
                                {item.time || (item.startTime ? formatTime(item.startTime) : 'TBD')}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {isClass 
                                ? (item.venue?.name || item.venue?.address || 'Online Class')
                                : (item.location || item.venue?.name || item.venue || 'Location TBD')
                              }
                            </span>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(isClass ? `/class/${item.id}` : `/meetup/${item.id}`);
                              }}
                              className="ml-auto w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"
                            >
                              <ArrowRight className="w-3 h-3 text-primary" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Discover Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Discover</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Expert-led classes, vibes & venues</p>
            </div>
            <motion.button
              onClick={() => navigate('/discover')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
          
          <Tabs value={discoverTab} onValueChange={(v) => setDiscoverTab(v as 'vibes' | 'venues')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted rounded-xl p-1 h-10 mb-4">
              <TabsTrigger value="vibes" className="rounded-lg text-sm data-[state=active]:bg-card">
                Vibes
              </TabsTrigger>
              <TabsTrigger value="venues" className="rounded-lg text-sm data-[state=active]:bg-card">
                Venues
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vibes" className="mt-0">
              <div className="space-y-3">
                <AnimatePresence>
                  {meetupsLoading ? (
                    <div className="text-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 mx-auto mb-4 rounded-full border-4 border-primary/20 border-t-primary"
                      />
                      <p className="text-muted-foreground">Loading events...</p>
                    </div>
                  ) : discoverMeetups.length > 0 ? (
                    discoverMeetups.slice(0, 5).map((meetup: any, index: number) => {
                      const hostName = meetup.host?.name || meetup.creator?.displayName || 
                        (meetup.creator ? `${meetup.creator.firstName} ${meetup.creator.lastName}` : 'Unknown');
                      
                      return (
                        <motion.div
                          key={meetup.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => navigate(`/meetup/${meetup.id}`)}
                          className="flex gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-colors cursor-pointer group"
                        >
                          {/* Image */}
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                            {meetup.image ? (
                              <img src={meetup.image} alt={meetup.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                <span className="text-2xl">{meetup.categoryEmoji || '🎉'}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium mb-1 text-primary">
                              {hostName}
                            </p>
                            <h3 className="text-base font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                              {meetup.title}
                            </h3>
                            <div className="space-y-1">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{formatDate(meetup.date || meetup.startTime)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span className="text-[#FF8C00] font-semibold">
                                    {formatTime(meetup.time || meetup.startTime)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {meetup.location || meetup.venue?.name || meetup.venue || 'Location TBD'}
                                </span>
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/meetup/${meetup.id}`);
                                  }}
                                  className="ml-auto w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"
                                >
                                  <ArrowRight className="w-3 h-3 text-primary" />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No events found. Try adjusting your filters.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="venues" className="mt-0">
              <div className="grid grid-cols-2 gap-3">
                {venuesLoading ? (
                  <div className="text-center py-8 col-span-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 mx-auto mb-4 rounded-full border-4 border-primary/20 border-t-primary"
                    />
                    <p className="text-muted-foreground">Loading venues...</p>
                  </div>
                ) : venues && venues.length > 0 ? (
                  venues.slice(0, 6).map((venue: any) => (
                    <VenueCard
                      key={venue.id}
                      {...venue}
                      onPress={() => navigate(`/venue/${venue.id}`)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 col-span-2">
                    <p className="text-muted-foreground">No venues found.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>

      {/* Create Story Modal */}
      <CreateStoryModal
        open={showCreateStoryModal}
        onOpenChange={setShowCreateStoryModal}
        onSuccess={() => {
          // Refresh stories after creation
        }}
      />

      <BottomNav />
    </MobileLayout>
  );
};

export default HomePage;
