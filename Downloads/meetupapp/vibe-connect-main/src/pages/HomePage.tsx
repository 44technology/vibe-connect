import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Plus, Calendar, Clock, MapPin, ArrowRight, GraduationCap } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import { meetups as mockMeetups, venues as mockVenues } from '@/data/mockData';
import { useNotifications } from '@/hooks/useNotifications';
import { useMeetups } from '@/hooks/useMeetups';
import { useVenues } from '@/hooks/useVenues';
import { useAuth } from '@/contexts/AuthContext';
import VenueCard from '@/components/cards/VenueCard';
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
  const [filters, setFilters] = useState({
    category: '',
    distance: '',
    priceRange: '',
    rating: '',
  });
  
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

  // Separate meetups into "Your Activities" and "Discover"
  const yourActivities = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    return meetups.filter((meetup: any) => {
      // Check if user is creator/host
      if (meetup.creator?.id === user.id || meetup.host?.id === user.id) return true;
      // Check if user is a member/attendee
      if (meetup.members?.some((m: any) => m.user?.id === user.id || m.id === user.id)) return true;
      return false;
    });
  }, [meetups, isAuthenticated, user]);

  const discoverMeetups = useMemo(() => {
    // Show all meetups except user's own activities
    const yourActivityIds = new Set(yourActivities.map((m: any) => m.id));
    return meetups.filter((meetup: any) => !yourActivityIds.has(meetup.id));
  }, [meetups, yourActivities]);

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
        {/* Quick Access - Classes */}
        <section>
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
                <h3 className="font-bold text-foreground text-base">Classes & Mentorship</h3>
                <p className="text-xs text-muted-foreground">Learn from instructors, mentors & venues</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </motion.button>
        </section>

        {/* Your Activities Section */}
        {yourActivities.length > 0 && (
          <section>
            <motion.button
              onClick={() => navigate('/my-meetups')}
              className="flex items-center justify-between w-full mb-4 group"
            >
              <h2 className="text-xl font-bold text-foreground">Your Activities</h2>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.button>
            <div className="space-y-3">
              <AnimatePresence>
                {yourActivities.map((meetup: any, index: number) => {
                  const hostName = meetup.host?.name || meetup.creator?.displayName || 
                    (meetup.creator ? `${meetup.creator.firstName} ${meetup.creator.lastName}` : 'You');
                  const isYou = isAuthenticated && user && (
                    meetup.host?.id === user.id || meetup.creator?.id === user.id
                  );
                  
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
                        <p className={`text-sm font-medium mb-1 ${isYou ? 'text-primary' : 'text-primary'}`}>
                          {isYou ? 'You' : hostName}
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
                })}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Discover Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Discover</h2>
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


      <BottomNav />
    </MobileLayout>
  );
};

export default HomePage;
