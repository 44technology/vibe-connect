import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  X, ChevronRight, MapPin, Calendar, Clock, Users, 
  Coffee, UtensilsCrossed, Dumbbell, Film, Heart, 
  Palette, PartyPopper, Briefcase, Sparkles, Camera,
  Globe, Lock, DollarSign, Search, Info, Star, Phone, ExternalLink,
  Shield, Share2, CheckCircle2, ArrowRight, Ticket, Users2, Gift
} from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useVenues, useVenue } from '@/hooks/useVenues';
import { useCreateMeetup } from '@/hooks/useMeetups';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

const categoryOptions = [
  { id: 'coffee', icon: Coffee, label: 'Coffee', emoji: '☕', venueTypes: ['café', 'coffee', 'cafe'] },
  { id: 'dining', icon: UtensilsCrossed, label: 'Dining', emoji: '🍽️', venueTypes: ['restaurant', 'dining', 'food'] },
  { id: 'sports', icon: Dumbbell, label: 'Sports', emoji: '🎾', venueTypes: ['sports', 'gym', 'park', 'stadium'] },
  { id: 'cinema', icon: Film, label: 'Cinema', emoji: '🎬', venueTypes: ['cinema', 'theater', 'entertainment'] },
  { id: 'wellness', icon: Heart, label: 'Wellness', emoji: '🧘', venueTypes: ['wellness', 'spa', 'yoga', 'fitness'] },
  { id: 'activities', icon: Palette, label: 'Activities', emoji: '🎨', venueTypes: ['activities', 'art', 'museum', 'gallery'] },
  { id: 'events', icon: PartyPopper, label: 'Events', emoji: '🎉', venueTypes: ['events', 'venue', 'hall', 'club'] },
  { id: 'networking', icon: Briefcase, label: 'Networking', emoji: '💼', venueTypes: ['networking', 'coworking', 'business'] },
  { id: 'custom', icon: Sparkles, label: 'Custom', emoji: '✨', venueTypes: [] },
];

const visibilityOptions = [
  { id: 'public', label: 'Public', description: 'Anyone can see and join', icon: Globe },
  { id: 'private', label: 'Private', description: 'Invite only event', icon: Lock },
];

const pricingOptions = [
  { id: 'free', label: 'Free', description: 'No cost to attend' },
  { id: 'paid', label: 'Paid', description: 'Set a price per person' },
];

const groupSizeOptions = [
  { id: '1-1', label: '1-on-1', icon: '👥', value: 2 },
  { id: '2-4', label: '2-4 people', icon: '👥👥', value: 4 },
  { id: '4+', label: '4+ people', icon: '👥👥👥', value: 10 },
  { id: 'custom', label: 'Custom', icon: '✏️', value: null },
];

// Mock venues for fallback with venue types
const suggestedVenues = [
  { id: '1', name: 'Panther Coffee, Wynwood', address: '2390 NW 2nd Ave, Miami', city: 'Miami', rating: 4.8, phone: '(305) 555-0123', website: 'https://panthercoffee.com', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400', priceRange: '$$', reviewCount: 342, category: 'Café', venueType: 'café' },
  { id: '2', name: 'Bayfront Park, Downtown', address: '301 Biscayne Blvd, Miami', city: 'Miami', rating: 4.5, phone: '(305) 555-0124', website: '', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', priceRange: '', reviewCount: 128, category: 'Park', venueType: 'park' },
  { id: '3', name: 'Flamingo Park, South Beach', address: '1200 Jefferson Ave, Miami Beach', city: 'Miami Beach', rating: 4.7, phone: '(305) 555-0125', website: '', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', priceRange: '', reviewCount: 89, category: 'Park', venueType: 'park' },
  { id: '4', name: 'Zuma Miami', address: '270 Biscayne Blvd Way, Miami', city: 'Miami', rating: 4.9, phone: '(305) 555-0126', website: 'https://zumarestaurant.com', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', priceRange: '$$$', reviewCount: 512, category: 'Japanese', venueType: 'restaurant' },
  { id: '5', name: 'Joe\'s Stone Crab', address: '11 Washington Ave, Miami Beach', city: 'Miami Beach', rating: 4.6, phone: '(305) 555-0127', website: 'https://joesstonecrab.com', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', priceRange: '$$$', reviewCount: 892, category: 'Restaurant', venueType: 'restaurant' },
  { id: '6', name: 'Versailles Restaurant', address: '3555 SW 8th St, Miami', city: 'Miami', rating: 4.4, phone: '(305) 555-0128', website: '', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', priceRange: '$$', reviewCount: 1245, category: 'Restaurant', venueType: 'restaurant' },
];

// Sample menu items for restaurants
const sampleMenuItems = [
  {
    id: '1',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon butter sauce',
    price: 28,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    ingredients: ['Salmon', 'Lemon', 'Butter', 'Herbs', 'Olive Oil'],
    calories: 420,
    category: 'Main Course',
  },
  {
    id: '2',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan and croutons',
    price: 16,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    ingredients: ['Romaine Lettuce', 'Parmesan', 'Croutons', 'Caesar Dressing'],
    calories: 280,
    category: 'Salad',
  },
  {
    id: '3',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center',
    price: 12,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Sugar', 'Flour'],
    calories: 450,
    category: 'Dessert',
  },
];

type Step = 'category' | 'details' | 'location' | 'datetime' | 'settings';

const CreateVibePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('category');
  const [category, setCategory] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [groupSize, setGroupSize] = useState('2-4');
  const [customGroupSize, setCustomGroupSize] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [pricing, setPricing] = useState('free');
  const [pricePerPerson, setPricePerPerson] = useState('');
  const [searchVenue, setSearchVenue] = useState('');
  const [showVenueDetail, setShowVenueDetail] = useState(false);
  const [selectedVenueDetail, setSelectedVenueDetail] = useState<any>(null);
  const [eventType, setEventType] = useState<'activity' | 'event'>('activity');
  const [showTypeRecommendationModal, setShowTypeRecommendationModal] = useState(false);
  const [recommendedType, setRecommendedType] = useState<'activity' | 'event' | null>(null);
  const [recommendedMaxAttendees, setRecommendedMaxAttendees] = useState<number>(0);
  
  // Fetch venues from backend
  const { data: venuesData, isLoading: venuesLoading } = useVenues({
    search: searchVenue || undefined,
  });
  
  // Fetch detailed venue data when a venue is selected for detail view
  const { data: venueDetailData } = useVenue(selectedVenueId || '');
  
  const createMeetup = useCreateMeetup();
  
  // Get selected category's venue types
  const selectedCategory = categoryOptions.find(c => c.id === category);
  const venueTypeFilters = selectedCategory?.venueTypes || [];
  
  // Use backend venues if available, otherwise use mock data
  const allVenues = venuesData && venuesData.length > 0 
    ? venuesData.map(v => {
        // Try to determine venue type from amenities or description
        const venueType = v.amenities?.find((a: string) => 
          ['restaurant', 'café', 'cafe', 'dining', 'food'].some(type => 
            a.toLowerCase().includes(type.toLowerCase())
          )
        ) ? 'restaurant' : 
        v.amenities?.find((a: string) => 
          ['café', 'cafe', 'coffee'].some(type => 
            a.toLowerCase().includes(type.toLowerCase())
          )
        ) ? 'café' : 'venue';
        
        return {
          id: v.id,
          name: v.name,
          address: v.address,
          city: v.city,
          rating: 4.5, // Default rating
          phone: v.phone,
          website: v.website,
          image: v.image,
          priceRange: '$$', // Default
          reviewCount: v._count?.meetups || 0,
          category: v.description || 'Venue',
          venueType,
        };
      })
    : suggestedVenues;
  
  // Filter venues by category if category is selected
  const venues = category && venueTypeFilters.length > 0
    ? allVenues.filter(v => {
        const venueType = (v.venueType || v.category?.toLowerCase() || '').toLowerCase();
        const venueName = (v.name || '').toLowerCase();
        return venueTypeFilters.some(vt => 
          venueType.includes(vt.toLowerCase()) || 
          venueName.includes(vt.toLowerCase())
        );
      })
    : allVenues;

  const steps: Step[] = ['category', 'details', 'location', 'datetime', 'settings'];
  const currentStepIndex = steps.indexOf(step);

  const handleNext = async () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    } else {
      // Submit vibe
      await handleCreateVibe();
    }
  };
  
  const handleCreateVibe = async () => {
    try {
      if (!title || !title.trim()) {
        toast.error('Please enter a title');
        return;
      }
      
      if (!date || !time) {
        toast.error('Please select both date and time');
        return;
      }
      
      // Combine date and time - ensure proper ISO format
      // Date format: YYYY-MM-DD, Time format: HH:MM
      const dateTimeString = `${date}T${time}:00`;
      const startTimeDate = new Date(dateTimeString);
      
      // Validate date
      if (isNaN(startTimeDate.getTime())) {
        toast.error('Invalid date or time');
        return;
      }
      
      // Ensure future date
      if (startTimeDate < new Date()) {
        toast.error('Please select a future date and time');
        return;
      }
      
      const startTime = startTimeDate.toISOString();
      
      // Parse group size to maxAttendees
      let maxAttendees: number;
      if (groupSize === 'custom' && customGroupSize) {
        const customValue = parseInt(customGroupSize);
        if (isNaN(customValue) || customValue < 1) {
          toast.error('Please enter a valid number for custom group size');
          return;
        }
        maxAttendees = customValue;
      } else {
        const selectedOption = groupSizeOptions.find(opt => opt.id === groupSize);
        maxAttendees = selectedOption?.value || 4;
      }
      
      const meetupData: any = {
        title: title.trim(),
        description: description?.trim() || undefined,
        startTime,
        category: category || undefined,
        maxAttendees,
        isPublic: visibility === 'public',
        isFree: pricing === 'free',
        location: venueAddress || venue || undefined,
        type: eventType, // 'activity' or 'event'
      };
      
      if (pricing === 'paid' && pricePerPerson) {
        const price = parseFloat(pricePerPerson);
        if (isNaN(price) || price <= 0) {
          toast.error('Please enter a valid price');
          return;
        }
        meetupData.pricePerPerson = price;
      }
      
      // Only add venueId if it's a valid UUID format
      if (selectedVenueId) {
        // Check if it's a valid UUID format (8-4-4-4-12 hex digits)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(selectedVenueId)) {
          meetupData.venueId = selectedVenueId;
        }
        // If it's not a UUID (mock data), don't send venueId - silently skip
      }
      
      await createMeetup.mutateAsync(meetupData);
      toast.success('Vibe created successfully!');
      navigate('/my-meetups');
    } catch (error: any) {
      console.error('Create vibe error:', error);
      // Try to get detailed error message
      let errorMessage = 'Failed to create vibe';
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = errors.map((e: any) => `${e.path}: ${e.message}`).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };
  
  const handleVenueSelect = (venueItem: any) => {
    setVenue(venueItem.name);
    setVenueAddress(venueItem.address);
    setSelectedVenueId(venueItem.id);
    setShowVenueDetail(false);
  };
  
  const handleVenueDetailClick = (venueItem: any) => {
    setSelectedVenueDetail(venueItem);
    if (venueItem.id) {
      setSelectedVenueId(venueItem.id);
    }
    setShowVenueDetail(true);
  };
  
  // Use detailed venue data if available, otherwise use the selected venue item
  const displayVenue = venueDetailData || selectedVenueDetail;
  const isRestaurant = displayVenue?.venueType === 'restaurant' ||
                       displayVenue?.category?.toLowerCase().includes('restaurant') || 
                       displayVenue?.category?.toLowerCase().includes('dining') ||
                       displayVenue?.category?.toLowerCase().includes('food') ||
                       displayVenue?.name?.toLowerCase().includes('restaurant');

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    } else {
      navigate(-1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'category': return !!category;
      case 'details': return !!title.trim();
      case 'location': return !!venue.trim();
      case 'datetime': return !!date && !!time;
      case 'settings': {
        const groupSizeValid = groupSize !== 'custom' || (groupSize === 'custom' && !!customGroupSize && parseInt(customGroupSize) > 0);
        const pricingValid = pricing === 'free' || (pricing === 'paid' && !!pricePerPerson);
        return groupSizeValid && pricingValid;
      }
      default: return false;
    }
  };

  const selectedCategoryData = categoryOptions.find(c => c.id === category);

  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchVenue.toLowerCase()) ||
    v.address.toLowerCase().includes(searchVenue.toLowerCase())
  );

  return (
    <MobileLayout hideNav>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 glass safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <motion.button
              onClick={handleBack}
              className="p-2 -ml-2"
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-foreground" />
            </motion.button>
            <h1 className="font-bold text-foreground">Create Vibe</h1>
            <div className="w-10" />
          </div>
          
          {/* Progress bar */}
          <div className="px-4 pb-3">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-6">
          <AnimatePresence mode="wait">
            {step === 'category' && (
              <motion.div
                key="category"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-foreground">What kind of vibe?</h2>
                  <p className="text-muted-foreground mt-1">Choose a category for your vibe</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {categoryOptions.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <motion.button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                          isSelected 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border bg-card'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-3xl">{cat.emoji}</span>
                        <span className="font-medium text-foreground">{cat.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Tell us more</h2>
                  <p className="text-muted-foreground mt-1">Give your vibe a catchy title</p>
                </div>

                {/* Cover photo placeholder */}
                <motion.button 
                  className="w-full h-32 rounded-2xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-2"
                  whileTap={{ scale: 0.98 }}
                >
                  <Camera className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Add cover photo</span>
                </motion.button>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Vibe Title
                    </label>
                    <Input
                      placeholder={`e.g., "Saturday morning ${selectedCategoryData?.label.toLowerCase() || 'hangout'}"`}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Description (optional)
                    </label>
                    <Textarea
                      placeholder="Tell people what to expect..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl min-h-[100px]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'location' && (
              <motion.div
                key="location"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Where to meet?</h2>
                  <p className="text-muted-foreground mt-1">Choose a location for your vibe</p>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for a venue..."
                    value={searchVenue}
                    onChange={(e) => setSearchVenue(e.target.value)}
                    className="h-14 pl-12 rounded-2xl"
                  />
                </div>

                {/* Selected venue */}
                {venue && (
                  <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{venue}</p>
                        <p className="text-sm text-muted-foreground">{venueAddress}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Venue suggestions */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Popular near you</p>
                  {venuesLoading ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Loading venues...</p>
                    </div>
                  ) : filteredVenues.length > 0 ? (
                    filteredVenues.map((place) => (
                      <motion.div
                        key={place.id || place.name}
                        className={`w-full p-4 rounded-xl border-2 transition-all ${
                          venue === place.name ? 'border-primary bg-primary/10' : 'border-border bg-card'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{place.name}</p>
                            <p className="text-sm text-muted-foreground">{place.address}</p>
                            {place.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 fill-secondary text-secondary" />
                                <span className="text-xs text-muted-foreground">{place.rating}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() => handleVenueDetailClick(place)}
                              className="p-2 rounded-lg hover:bg-muted transition-colors"
                              whileTap={{ scale: 0.9 }}
                            >
                              <Info className="w-5 h-5 text-muted-foreground" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleVenueSelect(place)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                venue === place.name
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground hover:bg-muted/80'
                              }`}
                              whileTap={{ scale: 0.95 }}
                            >
                              {venue === place.name ? 'Selected' : 'Select'}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No venues found</p>
                    </div>
                  )}
                </div>

                {/* Custom address */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Or enter custom address
                  </label>
                  <Input
                    placeholder="Enter address manually..."
                    value={venueAddress}
                    onChange={(e) => {
                      setVenueAddress(e.target.value);
                      if (!venue) setVenue('Custom Location');
                    }}
                    className="h-12 rounded-xl"
                  />
                </div>
              </motion.div>
            )}

            {step === 'datetime' && (
              <motion.div
                key="datetime"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-foreground">When?</h2>
                  <p className="text-muted-foreground mt-1">Pick a date and time</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Date
                    </label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-14 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Time
                    </label>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="h-14 rounded-xl"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                    Final touches
                  </h2>
                  <p className="text-muted-foreground text-sm">Customize your vibe experience</p>
                </div>

                <div className="space-y-8">
                  {/* Group Size */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <label className="text-base font-semibold text-foreground">Group Size</label>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {groupSizeOptions.map((option, index) => (
                        <motion.button
                          key={option.id}
                          onClick={() => {
                            setGroupSize(option.id);
                            // Show recommendation modal when group size is selected
                            if (option.id === 'custom') {
                              // Will show modal when custom value is entered
                              return;
                            }
                            const maxAttendees = option.value || 4;
                            if (maxAttendees > 10) {
                              setRecommendedType('event');
                              setRecommendedMaxAttendees(maxAttendees);
                              setShowTypeRecommendationModal(true);
                            } else if (maxAttendees <= 10) {
                              setRecommendedType('activity');
                              setRecommendedMaxAttendees(maxAttendees);
                              setShowTypeRecommendationModal(true);
                            }
                          }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15 + index * 0.05 }}
                          className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-300 ${
                            groupSize === option.id 
                              ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/20' 
                              : 'border-border/50 bg-card hover:border-primary/30 hover:bg-muted/50'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {groupSize === option.id && (
                            <motion.div
                              layoutId="groupSizeIndicator"
                              className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary"
                              initial={false}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <p className={`text-xs font-semibold ${
                            groupSize === option.id ? 'text-primary' : 'text-foreground'
                          }`}>
                            {option.label}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                    {groupSize === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                      >
                        <Input
                          type="number"
                          placeholder="Enter number of people"
                          value={customGroupSize}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCustomGroupSize(value);
                            const numValue = parseInt(value);
                            if (!isNaN(numValue) && numValue > 0) {
                              if (numValue > 10) {
                                setRecommendedType('event');
                                setRecommendedMaxAttendees(numValue);
                                setShowTypeRecommendationModal(true);
                              } else if (numValue <= 10) {
                                setRecommendedType('activity');
                                setRecommendedMaxAttendees(numValue);
                                setShowTypeRecommendationModal(true);
                              }
                            }
                          }}
                          className="h-12 rounded-xl"
                          min="1"
                        />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Visibility */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <label className="text-base font-bold text-foreground">Visibility</label>
                        <p className="text-xs text-muted-foreground">Who can see your vibe?</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {visibilityOptions.map((option, index) => {
                        const Icon = option.icon;
                        return (
                          <motion.button
                            key={option.id}
                            onClick={() => setVisibility(option.id)}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 + index * 0.05 }}
                            className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                              visibility === option.id 
                                ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/20' 
                                : 'border-border/50 bg-card hover:border-primary/30 hover:bg-muted/50'
                            }`}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {visibility === option.id && (
                              <motion.div
                                layoutId="visibilityIndicator"
                                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            )}
                            <div className="flex flex-col items-center text-center space-y-2">
                              <div className={`p-3 rounded-xl ${
                                visibility === option.id 
                                  ? 'bg-primary/20' 
                                  : 'bg-muted'
                              }`}>
                                <Icon className={`w-6 h-6 ${
                                  visibility === option.id 
                                    ? 'text-primary' 
                                    : 'text-muted-foreground'
                                }`} />
                              </div>
                              <p className={`text-sm font-semibold ${
                                visibility === option.id ? 'text-primary' : 'text-foreground'
                              }`}>
                                {option.label}
                              </p>
                              <p className="text-xs text-muted-foreground leading-tight">
                                {option.description}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Pricing */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <label className="text-base font-semibold text-foreground">Pricing</label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {pricingOptions.map((option, index) => (
                        <motion.button
                          key={option.id}
                          onClick={() => setPricing(option.id)}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.35 + index * 0.05 }}
                          className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                            pricing === option.id 
                              ? 'border-primary bg-gradient-to-br from-primary via-primary/90 to-primary/80 shadow-xl shadow-primary/30 scale-105' 
                              : 'border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:bg-muted/30'
                          }`}
                          whileHover={{ scale: pricing === option.id ? 1.05 : 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {pricing === option.id && (
                            <motion.div
                              layoutId="pricingIndicator"
                              className="absolute top-3 right-3 w-3 h-3 rounded-full bg-white shadow-lg"
                              initial={false}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <motion.div
                                className="w-full h-full rounded-full bg-primary"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1 }}
                              />
                            </motion.div>
                          )}
                          <div className="text-center space-y-2">
                            <p className={`text-base font-bold transition-colors ${
                              pricing === option.id ? 'text-white' : 'text-foreground'
                            }`}>
                              {option.label}
                            </p>
                            <p className={`text-xs leading-tight transition-colors ${
                              pricing === option.id ? 'text-white/80' : 'text-muted-foreground'
                            }`}>
                              {option.description}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    {pricing === 'paid' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="Enter price per person"
                            value={pricePerPerson}
                            onChange={(e) => setPricePerPerson(e.target.value)}
                            className="h-14 rounded-2xl pl-12 border-2 border-border/50 focus:border-primary bg-card"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 ml-1">
                          Set the price each attendee will pay
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 glass safe-bottom">
          <div className="px-4 py-4">
            <Button
              onClick={handleNext}
              disabled={!canProceed() || createMeetup.isPending}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              {createMeetup.isPending 
                ? 'Creating...' 
                : step === 'settings' 
                  ? 'Create Vibe' 
                  : 'Continue'}
              {!createMeetup.isPending && <ChevronRight className="ml-2" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Venue Detail Dialog */}
      <Dialog open={showVenueDetail} onOpenChange={setShowVenueDetail}>
        <DialogContent className="max-w-md mx-4 rounded-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          {displayVenue && (
            <>
              {/* Image Header */}
              <div className="relative h-48 w-full">
                <img 
                  src={displayVenue.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'} 
                  alt={displayVenue.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm">
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    <span className="text-sm font-medium text-card">{displayVenue.rating || 4.5}</span>
                    {displayVenue.reviewCount && (
                      <span className="text-xs text-card/80">({displayVenue.reviewCount})</span>
                    )}
                  </div>
                  {displayVenue.priceRange && (
                    <div className="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm">
                      <span className="text-xs font-medium text-card">{displayVenue.priceRange}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <DialogHeader className="pt-4">
                  <DialogTitle className="text-2xl">{displayVenue.name}</DialogTitle>
                  <p className="text-muted-foreground mt-1">{displayVenue.category || displayVenue.city}</p>
                </DialogHeader>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground line-clamp-1">{displayVenue.address}</span>
                  </div>
                  {displayVenue.phone && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                      <Phone className="w-4 h-4 text-primary" />
                      <a href={`tel:${displayVenue.phone}`} className="text-sm text-primary hover:underline line-clamp-1">
                        {displayVenue.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="ambiance" className="w-full mt-4">
                  <TabsList className="grid w-full grid-cols-3 bg-muted rounded-xl p-1 h-12">
                    <TabsTrigger value="ambiance" className="rounded-lg">Ambiance</TabsTrigger>
                    <TabsTrigger value="menu" className="rounded-lg">
                      {isRestaurant ? 'Menu' : 'Services'}
                    </TabsTrigger>
                    <TabsTrigger value="safety" className="rounded-lg">Safety</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ambiance" className="mt-4 space-y-4">
                    <div className="card-elevated p-4">
                      <h3 className="font-semibold text-foreground mb-3">Ambiance</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Atmosphere</span>
                          <span className="text-sm font-medium text-foreground">Cozy & Modern</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Music</span>
                          <span className="text-sm font-medium text-foreground">Live Jazz (Weekends)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Lighting</span>
                          <span className="text-sm font-medium text-foreground">Warm & Dim</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Crowd</span>
                          <span className="text-sm font-medium text-foreground">Mixed Ages</span>
                        </div>
                      </div>
                    </div>

                    {/* Photo Gallery */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Photo Gallery</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="aspect-square rounded-xl overflow-hidden">
                            <img
                              src={`https://images.unsplash.com/photo-${1550000000000 + i}?w=400`}
                              alt={`Gallery ${i}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="menu" className="mt-4 space-y-4">
                    {isRestaurant ? (
                      <div className="card-elevated p-4">
                        <h3 className="font-semibold text-foreground mb-4">Menu</h3>
                        <div className="space-y-4">
                          {sampleMenuItems.map((item) => (
                            <div
                              key={item.id}
                              className="border-b border-border pb-4 last:border-0 last:pb-0"
                            >
                              <div className="flex gap-4">
                                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-1">
                                    <div>
                                      <h4 className="font-semibold text-foreground">{item.name}</h4>
                                      <p className="text-xs text-muted-foreground">{item.category}</p>
                                    </div>
                                    <span className="text-lg font-bold text-primary">${item.price}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                                  
                                  {/* Ingredients */}
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {item.ingredients.map((ingredient, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded-full bg-muted text-xs text-foreground"
                                      >
                                        {ingredient}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Calories */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Calories:</span>
                                    <span className="text-xs font-medium text-foreground">{item.calories} kcal</span>
                                    <motion.button
                                      className="ml-auto px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium flex items-center gap-1"
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Sparkles className="w-3 h-3" />
                                      View in AR
                                    </motion.button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="card-elevated p-4">
                        <h3 className="font-semibold text-foreground mb-3">Services</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <UtensilsCrossed className="w-5 h-5 text-primary" />
                            <span className="text-foreground">Full Bar Service</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-primary" />
                            <span className="text-foreground">Live Music Events</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Share2 className="w-5 h-5 text-primary" />
                            <span className="text-foreground">Private Event Booking</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Heart className="w-5 h-5 text-primary" />
                            <span className="text-foreground">VIP Lounge Access</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="safety" className="mt-4">
                    <div className="card-elevated p-4 space-y-4">
                      <h3 className="font-semibold text-foreground mb-3">Safety & Health</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Security</p>
                            <p className="text-sm text-muted-foreground">24/7 security staff on premises</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Health Protocols</p>
                            <p className="text-sm text-muted-foreground">Regular sanitization and health checks</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Emergency Contacts</p>
                            <p className="text-sm text-muted-foreground">On-site medical assistance available</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Accessibility</p>
                            <p className="text-sm text-muted-foreground">Wheelchair accessible facilities</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 px-4 pb-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowVenueDetail(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleVenueSelect(selectedVenueDetail);
                    setShowVenueDetail(false);
                  }}
                  className="flex-1 bg-gradient-primary"
                >
                  Select Venue
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Activity/Event Recommendation Modal */}
      <Dialog open={showTypeRecommendationModal} onOpenChange={setShowTypeRecommendationModal}>
        <DialogContent className="max-w-md mx-4 rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4">
            <div className="text-center mb-4">
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${
                recommendedType === 'event' 
                  ? 'bg-primary/20' 
                  : 'bg-secondary/20'
              }`}>
                {recommendedType === 'event' ? (
                  <Ticket className="w-8 h-8 text-primary" />
                ) : (
                  <Users2 className="w-8 h-8 text-secondary" />
                )}
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              {recommendedType === 'event' ? 'Event Recommended' : 'Activity Recommended'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {recommendedType === 'event' 
                ? 'Event mode is recommended for this attendance size. Ticket, check-in, and visibility features will be enabled.'
                : 'Activity mode is recommended for this attendance size. A more intimate and flexible gathering.'}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">

            <div className={`p-4 rounded-xl ${
              recommendedType === 'event' 
                ? 'bg-primary/10 border-2 border-primary/20' 
                : 'bg-secondary/10 border-2 border-secondary/20'
            }`}>
              {recommendedType === 'event' ? (
                <div className="space-y-2">
                  <p className="text-sm text-foreground font-medium">
                    Event is more suitable for this attendance size.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ticket, check-in, and visibility features will be enabled.
                  </p>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>Ticket management</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>QR Check-in</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>Enhanced visibility</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-foreground font-medium">
                    This is an Activity. A more intimate and flexible gathering.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ideal for small groups, a more casual experience.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTypeRecommendationModal(false);
                  if (recommendedType === 'event') {
                    setEventType('activity'); // User can choose to keep as activity
                  }
                }}
                className="flex-1"
              >
                {recommendedType === 'event' ? 'Keep as Activity' : 'OK'}
              </Button>
              {recommendedType === 'event' && (
                <Button
                  onClick={() => {
                    setEventType('event');
                    setShowTypeRecommendationModal(false);
                    toast.success('Event mode activated! Ticket and check-in features are now available.');
                  }}
                  className="flex-1 bg-gradient-primary"
                >
                  Use Event Mode
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default CreateVibePage;
