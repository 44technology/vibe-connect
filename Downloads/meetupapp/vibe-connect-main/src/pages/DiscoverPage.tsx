import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, Star, ChevronRight, GraduationCap, X, DollarSign, Award, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import VenueCard from '@/components/cards/VenueCard';
import MeetupCard from '@/components/cards/MeetupCard';
import { venues as mockVenues, meetups as mockMeetups } from '@/data/mockData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMeetups, useJoinMeetup } from '@/hooks/useMeetups';
import { useVenues } from '@/hooks/useVenues';
import { useClasses } from '@/hooks/useClasses';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonalization } from '@/hooks/usePersonalization';
import { toast } from 'sonner';
import ClassCard from '@/components/cards/ClassCard';

const DiscoverPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { personalize, trackJoin } = usePersonalization();
  const joinMeetup = useJoinMeetup();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    distance: '',
    priceRange: '',
    rating: '',
    priceFilter: 'all' as 'all' | 'free' | 'paid',
    certificateFilter: 'all' as 'all' | 'certified' | 'non-certified',
  });
  const [activeTab, setActiveTab] = useState<'vibes' | 'venues' | 'classes'>('classes');

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

  // Fetch classes with filters
  const { data: classesData, isLoading: classesLoading } = useClasses(
    searchQuery || undefined,
    filters.category || undefined
  );

  // Format and filter classes data for ClassCard component
  const formattedClasses = useMemo(() => {
    if (!classesData || classesData.length === 0) return [];
    
    let filtered = classesData.map((c: any) => ({
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
      isPopular: (c as any).isPopular || false,
      recentEnrollments: (c as any).recentEnrollments || 0,
    }));

    // Apply price filter
    if (filters.priceFilter === 'free') {
      filtered = filtered.filter(c => c.price === 0 || !c.price);
    } else if (filters.priceFilter === 'paid') {
      filtered = filtered.filter(c => c.price && c.price > 0);
    }

    // Apply certificate filter
    if (filters.certificateFilter === 'certified') {
      filtered = filtered.filter(c => c.hasCertificate);
    } else if (filters.certificateFilter === 'non-certified') {
      filtered = filtered.filter(c => !c.hasCertificate);
    }

    return filtered;
  }, [classesData, filters.priceFilter, filters.certificateFilter]);

  // Use API data if available, otherwise fall back to mock data
  // Check if meetupsData is empty or undefined, use mockMeetups as fallback
  const rawMeetups = (meetupsData && meetupsData.length > 0) ? meetupsData : (mockMeetups && mockMeetups.length > 0 ? mockMeetups : []);
  
  // Normalize and format meetups for display
  const normalizedMeetups = useMemo(() => {
    if (!rawMeetups || rawMeetups.length === 0) return [];
    
    return rawMeetups.map((meetup: any) => {
      // If it's already in API format (has startTime), return as-is
      if (meetup.startTime) {
        return meetup;
      }
      
      // Otherwise, normalize from mock data format
      let startTime = meetup.startTime;
      if (!startTime && meetup.date && meetup.time) {
        try {
          const dateObj = new Date(`${meetup.date} ${meetup.time}`);
          if (!isNaN(dateObj.getTime())) {
            startTime = dateObj.toISOString();
          } else {
            startTime = new Date().toISOString();
          }
        } catch (e) {
          startTime = new Date().toISOString();
        }
      } else if (!startTime) {
        startTime = new Date().toISOString();
      }
      
      return {
        ...meetup,
        startTime,
        creator: meetup.creator || (meetup.host ? {
          id: meetup.host.id || 'unknown',
          firstName: meetup.host.name?.split(' ')[0] || 'Unknown',
          lastName: meetup.host.name?.split(' ')[1] || '',
          displayName: meetup.host.name,
          avatar: meetup.host.avatar,
        } : {
          id: 'unknown',
          firstName: 'Unknown',
          lastName: '',
          displayName: 'Unknown',
        }),
        venue: meetup.venue && typeof meetup.venue === 'object' ? meetup.venue : (meetup.venue ? {
          id: 'venue-' + meetup.id,
          name: typeof meetup.venue === 'string' ? meetup.venue : meetup.venue.name || 'Location TBD',
          address: meetup.location || '',
          city: meetup.location?.split(',')[1]?.trim() || '',
        } : undefined),
        location: meetup.location || (typeof meetup.venue === 'string' ? meetup.venue : meetup.venue?.name || 'Location TBD'),
        _count: meetup._count || { members: meetup.attendees?.length || 0 },
        members: meetup.members || (meetup.attendees?.map((a: any) => ({
          id: a.id,
          user: {
            id: a.id,
            firstName: a.name?.split(' ')[0] || 'User',
            lastName: a.name?.split(' ')[1] || '',
            displayName: a.name,
            avatar: a.avatar,
          },
          status: 'going',
        })) || []),
      };
    });
  }, [rawMeetups]);
  
  // Personalize meetups based on user behavior, location, time, interests, and context
  const meetups = useMemo(() => {
    if (!isAuthenticated || !user) return normalizedMeetups;
    
    const userLocation = filters.distance ? { latitude: userLat, longitude: userLon } : undefined;
    
    // If search or filters are active, use filtered results
    if (searchQuery || filters.category || filters.distance || filters.priceRange) {
      return normalizedMeetups; // Keep filters as-is
    }
    
    // Otherwise, apply personalization
    return personalize(normalizedMeetups, userLocation);
  }, [normalizedMeetups, isAuthenticated, user, filters, searchQuery, userLat, userLon, personalize]);
  
  const venues = venuesData && venuesData.length > 0 ? venuesData : mockVenues;

  const handleJoinVibe = async (meetupId: string, meetup: any) => {
    if (!isAuthenticated) {
      toast.error('Please login to join a vibe');
      navigate('/login');
      return;
    }

    try {
      await joinMeetup.mutateAsync({ meetupId, status: 'going' });
      
      // Track for personalization
      if (user) {
        trackJoin(meetup);
      }
      
      toast.success('Joined the vibe!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to join vibe');
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-foreground mb-3">Discover</h1>
          <p className="text-sm text-muted-foreground mb-3">Real entrepreneurs. Real results. Real connections through learning.</p>
          
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search classes, vibes, or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <motion.button 
              className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilterDialog(true)}
            >
              <Filter className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'vibes' | 'venues' | 'classes')} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-muted rounded-xl p-1 h-12">
            <TabsTrigger value="vibes" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Vibes
            </TabsTrigger>
            <TabsTrigger value="venues" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Venues
            </TabsTrigger>
            <TabsTrigger value="classes" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Classes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vibes" className="mt-4 space-y-4">
            {meetupsLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading vibes...</p>
              </div>
            ) : meetups && meetups.length > 0 ? (
              meetups.map((meetup: any) => (
                <MeetupCard 
                  key={meetup.id} 
                  {...meetup} 
                  onPress={() => navigate(`/meetup/${meetup.id}`)}
                  onJoin={(e) => handleJoinVibe(meetup.id, meetup)}
                  showJoinButton={true}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No vibes found. Try adjusting your filters.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="venues" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {venuesLoading ? (
                <div className="text-center py-8 col-span-2">
                  <p className="text-muted-foreground">Loading venues...</p>
                </div>
              ) : venues && venues.length > 0 ? (
                venues.map((venue: any) => {
                  // Normalize venue data for VenueCard
                  const normalizedVenue = {
                    id: venue.id || '',
                    name: venue.name || 'Unknown Venue',
                    category: venue.category || venue.amenities?.[0] || 'Venue',
                    image: venue.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
                    rating: venue.rating || 4.5,
                    reviewCount: venue.reviewCount || venue._count?.meetups || 0,
                    distance: venue.distance || `${Math.round(Math.random() * 5 + 0.5)} mi`,
                    priceRange: venue.priceRange,
                    isOpen: venue.isOpen !== undefined ? venue.isOpen : true,
                    hasDeals: venue.hasDeals || false,
                  };
                  
                  return (
                    <VenueCard
                      key={venue.id}
                      {...normalizedVenue}
                      onPress={() => {
                        if (venue.id) {
                          navigate(`/venue/${venue.id}`);
                        } else {
                          console.warn('Venue ID is missing:', venue);
                        }
                      }}
                    />
                  );
                })
              ) : (
                <div className="text-center py-8 col-span-2">
                  <p className="text-muted-foreground">No venues found. Try adjusting your filters.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="classes" className="mt-4 space-y-4">
            {classesLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading classes...</p>
              </div>
            ) : formattedClasses && formattedClasses.length > 0 ? (
              formattedClasses.map((classItem: any) => (
                <ClassCard
                  key={classItem.id}
                  {...classItem}
                  isPremium={classItem.isPremium}
                  isExclusive={classItem.isExclusive}
                  maxStudents={classItem.maxStudents}
                  isPopular={classItem.isPopular}
                  recentEnrollments={classItem.recentEnrollments}
                  onClick={() => navigate(`/class/${classItem.id}`)}
                  onEnroll={(e) => {
                    e?.stopPropagation();
                    navigate(`/class/${classItem.id}`);
                  }}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">No expert-led classes found</p>
                <p className="text-xs text-muted-foreground">Try adjusting your filters or search for different skills</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Elegant Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-md mx-4 rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Filter {activeTab === 'vibes' ? 'Vibes' : activeTab === 'venues' ? 'Venues' : 'Classes'}</DialogTitle>
            <DialogDescription>
              Refine your search with filters
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Category Filter - For Vibes and Classes */}
            {(activeTab === 'vibes' || activeTab === 'classes') && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Categories</option>
                  {activeTab === 'vibes' ? (
                    <>
                      <option value="coffee">Coffee</option>
                      <option value="café">Café</option>
                      <option value="japanese">Japanese</option>
                      <option value="italian">Italian</option>
                      <option value="sports">Sports</option>
                      <option value="park">Park</option>
                    </>
                  ) : (
                    <>
                      <option value="sports">Sports</option>
                      <option value="tennis">Tennis</option>
                      <option value="yoga">Yoga</option>
                      <option value="swimming">Swimming</option>
                      <option value="golf">Golf</option>
                      <option value="skydiving">Skydiving</option>
                      <option value="cooking">Cooking</option>
                      <option value="dance">Dance</option>
                      <option value="art">Art</option>
                      <option value="language">Language</option>
                      <option value="diction">Diction & Speech</option>
                      <option value="acting">Acting & Audition</option>
                      <option value="music">Music</option>
                      <option value="tech">Tech</option>
                      <option value="business">Business</option>
                      <option value="mentorship">Mentorship</option>
                      <option value="fitness">Fitness</option>
                      <option value="photography">Photography</option>
                      <option value="writing">Writing</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* Distance Filter - For Vibes and Venues */}
            {(activeTab === 'vibes' || activeTab === 'venues') && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Distance
                </label>
                <select
                  value={filters.distance}
                  onChange={(e) => setFilters({ ...filters, distance: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Any Distance</option>
                  <option value="1">Within 1 mile</option>
                  <option value="5">Within 5 miles</option>
                  <option value="10">Within 10 miles</option>
                  <option value="25">Within 25 miles</option>
                </select>
              </div>
            )}

            {/* Price Range Filter - For Vibes */}
            {activeTab === 'vibes' && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Any Price</option>
                  <option value="free">Free</option>
                  <option value="$">$ - Budget Friendly</option>
                  <option value="$$">$$ - Moderate</option>
                  <option value="$$$">$$$ - Expensive</option>
                </select>
              </div>
            )}

            {/* Price Filter - For Classes */}
            {activeTab === 'classes' && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Price
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    onClick={() => setFilters({ ...filters, priceFilter: 'all' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      filters.priceFilter === 'all'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted bg-muted text-foreground'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Tag className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">All</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setFilters({ ...filters, priceFilter: 'free' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      filters.priceFilter === 'free'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted bg-muted text-foreground'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Tag className="w-5 h-5 mx-auto mb-1 text-green-600" />
                    <span className="text-xs font-medium">Free</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setFilters({ ...filters, priceFilter: 'paid' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      filters.priceFilter === 'paid'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted bg-muted text-foreground'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <DollarSign className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">Paid</span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Certificate Filter - For Classes */}
            {activeTab === 'classes' && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Certificate
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    onClick={() => setFilters({ ...filters, certificateFilter: 'all' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      filters.certificateFilter === 'all'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted bg-muted text-foreground'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-xs font-medium">All</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setFilters({ ...filters, certificateFilter: 'certified' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      filters.certificateFilter === 'certified'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted bg-muted text-foreground'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Award className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">Certified</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setFilters({ ...filters, certificateFilter: 'non-certified' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      filters.certificateFilter === 'non-certified'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted bg-muted text-foreground'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-xs font-medium">No Cert</span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Rating Filter - For Vibes and Venues */}
            {(activeTab === 'vibes' || activeTab === 'venues') && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t border-border mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ 
                  category: '', 
                  distance: '', 
                  priceRange: '', 
                  rating: '',
                  priceFilter: 'all',
                  certificateFilter: 'all',
                });
              }}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                setShowFilterDialog(false);
              }}
              className="flex-1 bg-gradient-primary text-primary-foreground"
            >
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </MobileLayout>
  );
};

export default DiscoverPage;
