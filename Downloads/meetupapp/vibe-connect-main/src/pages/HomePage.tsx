import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Coffee, UtensilsCrossed, Dumbbell, Film, Heart, Users, Palette, PartyPopper, Briefcase, Sparkles, ChevronRight, Plus, Store, Filter, GraduationCap } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import CategoryChip from '@/components/ui/CategoryChip';
import MeetupCard from '@/components/cards/MeetupCard';
import VenueCard from '@/components/cards/VenueCard';
import ActiveUserCard from '@/components/cards/ActiveUserCard';
import { activeUsers, meetups as mockMeetups, venues as mockVenues } from '@/data/mockData';
import UserAvatar from '@/components/ui/UserAvatar';
import { useNotifications } from '@/hooks/useNotifications';
import { useMeetups } from '@/hooks/useMeetups';
import { useVenues } from '@/hooks/useVenues';
import { useStories } from '@/hooks/useStories';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CreateStoryModal from '@/components/CreateStoryModal';

const categories = [
  { id: '1', icon: Coffee, label: 'Coffee' },
  { id: '2', icon: UtensilsCrossed, label: 'Dining' },
  { id: '3', icon: Dumbbell, label: 'Sports' },
  { id: '4', icon: Film, label: 'Cinema' },
  { id: '5', icon: Heart, label: 'Yoga' },
  { id: '6', icon: Palette, label: 'Activities' },
  { id: '7', icon: PartyPopper, label: 'Events' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'vibes' | 'venues'>('vibes');
  const [filters, setFilters] = useState({
    category: '',
    distance: '',
    priceRange: '',
    rating: '',
  });
  
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications(isAuthenticated);
  const { data: storiesData } = useStories();

  // Convert distance filter to radius in miles
  const radius = filters.distance ? parseFloat(filters.distance) * 1.60934 : undefined; // Convert miles to km

  // Get user location (mock for now, should use geolocation API)
  const userLat = 25.7617; // Miami coordinates
  const userLon = -80.1918;

  // Fetch meetups with filters
  const { data: meetupsData, isLoading: meetupsLoading } = useMeetups({
    category: filters.category || selectedCategory || undefined,
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

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <UserAvatar 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" 
                alt="Alex" 
                size="md"
              />
              <div>
                <p className="text-sm text-muted-foreground">Good morning,</p>
                <h1 className="text-lg font-bold text-foreground">Alex! 👋</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => navigate('/venue-posts')}
                className="p-2 rounded-full bg-muted"
                whileTap={{ scale: 0.9 }}
              >
                <Store className="w-5 h-5 text-foreground" />
              </motion.button>
              <motion.button
                onClick={() => navigate('/create')}
                className="p-2 rounded-full bg-primary text-primary-foreground"
                whileTap={{ scale: 0.9 }}
              >
                <Plus className="w-5 h-5" />
              </motion.button>
              <motion.button 
                className="relative p-2"
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="w-6 h-6 text-foreground" />
                {notificationsData?.unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary" />
                )}
              </motion.button>
            </div>
          </div>

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

      <div className="px-4 pb-4 space-y-6">
        {/* Categories */}
        <section>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2 -mx-4 px-4">
            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                icon={cat.icon}
                label={cat.label}
                isActive={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              />
            ))}
          </div>
        </section>

        {/* Active Now */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Active Now</h2>
            <button className="text-sm text-primary font-medium flex items-center">
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 py-2">
            {activeUsers.map((user) => (
              <ActiveUserCard
                key={user.id}
                {...user}
              />
            ))}
          </div>
        </section>

        {/* Classes Quick Access */}
        <motion.button
          onClick={() => navigate('/classes')}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-connectme to-primary flex items-center justify-between"
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

        {/* Discover Section with Tabs */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Discover</h2>
          </div>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'vibes' | 'venues')} className="mt-4">
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
        </section>
      </div>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-md mx-4 rounded-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {notificationsLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading notifications...</p>
              </div>
            ) : notificationsData?.data && notificationsData.data.length > 0 ? (
              notificationsData.data.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl ${
                    notification.read ? 'bg-muted/50' : 'bg-primary/5 border border-primary/20'
                  }`}
                >
                  <h4 className="font-semibold text-foreground">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No notifications</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
                setShowFilterDialog(false);
              }}
              className="bg-gradient-primary"
            >
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Story Modal */}
      <CreateStoryModal
        open={showCreateStory}
        onOpenChange={setShowCreateStory}
        onSuccess={() => {
          // Stories will auto-refresh via React Query
        }}
      />

      <BottomNav />
    </MobileLayout>
  );
};

export default HomePage;
