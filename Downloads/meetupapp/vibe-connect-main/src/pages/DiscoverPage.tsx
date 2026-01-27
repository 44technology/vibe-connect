import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, Star, ChevronRight, GraduationCap, X } from 'lucide-react';
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
import { useMeetups } from '@/hooks/useMeetups';
import { useVenues } from '@/hooks/useVenues';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonalization } from '@/hooks/usePersonalization';
import { toast } from 'sonner';

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
  });
  const [activeTab, setActiveTab] = useState<'vibes' | 'venues'>('vibes');

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
  const rawMeetups = meetupsData && meetupsData.length > 0 ? meetupsData : mockMeetups;
  
  // Personalize meetups based on user behavior, location, time, interests, and context
  const meetups = useMemo(() => {
    if (!isAuthenticated || !user) return rawMeetups;
    
    const userLocation = filters.distance ? { latitude: userLat, longitude: userLon } : undefined;
    
    // If search or filters are active, use filtered results
    if (searchQuery || filters.category || filters.distance || filters.priceRange) {
      return rawMeetups; // Keep filters as-is
    }
    
    // Otherwise, apply personalization
    return personalize(rawMeetups, userLocation);
  }, [rawMeetups, isAuthenticated, user, filters, searchQuery, userLat, userLon, personalize]);
  
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
          
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vibes or venues..."
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
        {/* Classes Quick Access */}
        <motion.button
          onClick={() => navigate('/classes')}
          className="w-full mt-4 p-4 rounded-2xl bg-gradient-to-r from-connectme to-primary flex items-center justify-between"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-primary-foreground">Classes & Lessons</h3>
              <p className="text-sm text-primary-foreground/80">Tennis, Yoga, Skydiving & more</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-primary-foreground" />
        </motion.button>

        <Tabs defaultValue="vibes" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted rounded-xl p-1 h-12">
            <TabsTrigger value="vibes" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Vibes
            </TabsTrigger>
            <TabsTrigger value="venues" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Venues
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
                venues.map((venue: any) => (
                  <VenueCard
                    key={venue.id}
                    {...venue}
                    onPress={() => navigate(`/venue/${venue.id}`)}
                  />
                ))
              ) : (
                <div className="text-center py-8 col-span-2">
                  <p className="text-muted-foreground">No venues found. Try adjusting your filters.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-md mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Filter Results</DialogTitle>
            <DialogDescription>
              Narrow down your search by category, distance, price, and rating.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-muted border-0 text-foreground"
              >
                <option value="">All Categories</option>
                <option value="coffee">Coffee</option>
                <option value="café">Café</option>
                <option value="japanese">Japanese</option>
                <option value="italian">Italian</option>
                <option value="sports">Sports</option>
                <option value="park">Park</option>
              </select>
            </div>

            {/* Distance Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Distance</label>
              <select
                value={filters.distance}
                onChange={(e) => setFilters({ ...filters, distance: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-muted border-0 text-foreground"
              >
                <option value="">Any Distance</option>
                <option value="1">Within 1 mile</option>
                <option value="5">Within 5 miles</option>
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-muted border-0 text-foreground"
              >
                <option value="">Any Price</option>
                <option value="free">Free</option>
                <option value="$">$ - Budget Friendly</option>
                <option value="$$">$$ - Moderate</option>
                <option value="$$$">$$$ - Expensive</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Minimum Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-muted border-0 text-foreground"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ category: '', distance: '', priceRange: '', rating: '' });
              }}
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                // TODO: Apply filters
                setShowFilterDialog(false);
              }}
              className="bg-gradient-primary"
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
