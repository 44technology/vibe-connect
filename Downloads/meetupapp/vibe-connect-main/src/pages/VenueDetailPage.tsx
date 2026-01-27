import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Clock, DollarSign, Heart, Share2, Shield, UtensilsCrossed, Sparkles, Camera, X, Tag, Percent, Calendar, Box, Eye, RotateCcw } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useVenue } from '@/hooks/useVenues';
import { toast } from 'sonner';

// Sample menu items for restaurants
const sampleMenuItems = [
  {
    id: '1',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon butter sauce',
    price: 28,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    arModel: '/models/salmon.glb', // Placeholder for 3D/AR model
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
    arModel: '/models/caesar.glb',
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
    arModel: '/models/cake.glb',
    ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Sugar', 'Flour'],
    calories: 450,
    category: 'Dessert',
  },
];

// Sample campaigns for venues
const sampleCampaigns = [
  {
    id: 'campaign-1',
    title: 'Happy Hour',
    description: '50% off on all drinks and appetizers',
    discount: '50% OFF',
    icon: '🍹',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    time: '5:00 PM - 7:00 PM',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    type: 'happy-hour',
  },
  {
    id: 'campaign-2',
    title: 'Ladies Night',
    description: 'Free entry and 30% off drinks for ladies',
    discount: '30% OFF',
    icon: '💃',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    time: '8:00 PM - 11:00 PM',
    days: ['Wednesday'],
    type: 'special',
  },
  {
    id: 'campaign-3',
    title: 'Student Discount',
    description: 'Show your student ID and get 25% off',
    discount: '25% OFF',
    icon: '🎓',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    time: 'All Day',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    type: 'discount',
  },
  {
    id: 'campaign-4',
    title: 'Weekend Special',
    description: 'Buy 2 get 1 free on selected items',
    discount: 'Buy 2 Get 1',
    icon: '🎉',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    time: 'All Day',
    days: ['Saturday', 'Sunday'],
    type: 'special',
  },
  {
    id: 'campaign-5',
    title: 'Early Bird',
    description: '20% off for reservations before 6 PM',
    discount: '20% OFF',
    icon: '🌅',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    time: '4:00 PM - 6:00 PM',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    type: 'discount',
  },
  {
    id: 'campaign-6',
    title: 'Free Appetizer',
    description: 'Get a free appetizer with any main course purchase',
    discount: 'FREE',
    icon: '🎁',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    time: 'All Day',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    type: 'free-item',
  },
  {
    id: 'campaign-7',
    title: 'Free Dessert',
    description: 'Complimentary dessert with dinner orders over $50',
    discount: 'FREE',
    icon: '🍰',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    time: '6:00 PM - 10:00 PM',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    type: 'free-item',
  },
];

const VenueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedARItem, setSelectedARItem] = useState<string | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<typeof sampleMenuItems[0] | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'ar'>('2d');
  const { data: venue, isLoading, error } = useVenue(id || '');
  
  // Determine if venue is a restaurant based on amenities or description
  const isRestaurant = venue?.amenities?.some(a => 
    a.toLowerCase().includes('restaurant') || 
    a.toLowerCase().includes('dining') ||
    a.toLowerCase().includes('food')
  ) || venue?.description?.toLowerCase().includes('restaurant') ||
     venue?.description?.toLowerCase().includes('dining') ||
     venue?.name?.toLowerCase().includes('restaurant');

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </MobileLayout>
    );
  }

  if (error || !venue) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <p className="text-muted-foreground">Venue not found</p>
          <Button onClick={() => navigate('/home')} className="mt-4">
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }
  
  // Format venue data
  const venueImage = venue.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
  const venueRating = 4.5; // Default rating (backend'de rating field'ı yok)
  const venueReviewCount = venue._count?.meetups || 0;
  const venuePriceRange = '$$'; // Default (backend'de priceRange field'ı yok)
  const venueDistance = '0.5 mi'; // Default (backend'de distance field'ı yok)
  const venueCategory = venue.description || 'Venue';
  const venueIsOpen = true; // Default (backend'de isOpen field'ı yok)

  const handleViewAR = (itemId: string) => {
    setSelectedARItem(itemId);
    toast.info('AR view would open here. In production, this would use AR.js or similar.');
  };

  const handleViewMenuItem = (item: typeof sampleMenuItems[0]) => {
    setSelectedMenuItem(item);
    setViewMode('2d'); // Reset to 2D view when opening menu item
  };

  // Separate campaigns and free items
  const campaigns = sampleCampaigns.filter(c => c.type !== 'free-item');
  const freeItems = sampleCampaigns.filter(c => c.type === 'free-item');

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-4 px-4 py-3">
          <motion.button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground flex-1 line-clamp-1">{venue.name}</h1>
          <div className="flex gap-2">
            <motion.button
              className="p-2 rounded-full bg-muted"
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </motion.button>
            <motion.button
              className="p-2 rounded-full bg-muted"
              whileTap={{ scale: 0.9 }}
            >
              <Heart className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="pb-4">
        {/* Image */}
        <div className="relative h-64 w-full">
          <img src={venueImage} alt={venue.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm">
              <Star className="w-4 h-4 fill-secondary text-secondary" />
              <span className="text-sm font-medium text-card">{venueRating}</span>
              {venueReviewCount > 0 && (
                <span className="text-xs text-card/80">({venueReviewCount})</span>
              )}
            </div>
            <div className="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm">
              <span className={`text-xs font-medium ${venueIsOpen ? 'text-friendme' : 'text-destructive'}`}>
                {venueIsOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-4 mt-4">
          {/* Basic Info */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">{venue.name}</h2>
            <p className="text-muted-foreground">{venueCategory}</p>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground line-clamp-1">{venue.address}</span>
            </div>
            {venuePriceRange && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">{venuePriceRange}</span>
              </div>
            )}
          </div>
          
          {/* Address Details */}
          <div className="space-y-1">
            <p className="text-sm text-foreground">{venue.address}</p>
            <p className="text-sm text-muted-foreground">{venue.city}{venue.state ? `, ${venue.state}` : ''} {venue.zipCode || ''}</p>
            {venue.phone && (
              <p className="text-sm text-primary">{venue.phone}</p>
            )}
            {venue.website && (
              <a 
                href={venue.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {venue.website}
              </a>
            )}
          </div>

          {/* Campaigns Section - Horizontal Scroll */}
          {campaigns.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground text-lg">Campaigns & Offers</h3>
              </div>
              <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
                <div className="flex gap-3" style={{ width: 'max-content' }}>
                  {campaigns.map((campaign) => {
                    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const isActive = campaign.days.includes(currentDay);
                    const currentHour = new Date().getHours();
                    const campaignStartHour = campaign.time === 'All Day' ? 0 : parseInt(campaign.time.split(' - ')[0]?.split(':')[0] || '0');
                    const campaignEndHour = campaign.time === 'All Day' ? 23 : parseInt(campaign.time.split(' - ')[1]?.split(':')[0] || '23');
                    const isTimeValid = campaign.time === 'All Day' || (currentHour >= campaignStartHour && currentHour < campaignEndHour);
                    
                    return (
                      <motion.div
                        key={campaign.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`card-elevated p-4 rounded-2xl border-2 flex-shrink-0 w-80 ${
                          isActive && isTimeValid ? 'border-primary/50 bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="relative w-full h-32 rounded-xl overflow-hidden">
                            <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                              <span className="text-3xl">{campaign.icon}</span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                campaign.discount.includes('%')
                                  ? 'bg-primary/90 text-white'
                                  : campaign.discount.includes('FREE') || campaign.discount.includes('Free')
                                  ? 'bg-friendme/90 text-white'
                                  : 'bg-secondary/90 text-white'
                              }`}>
                                {campaign.discount}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-foreground text-base">{campaign.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
                            <div className="flex flex-col gap-1 text-xs">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{campaign.time}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span className="line-clamp-1">{campaign.days.join(', ')}</span>
                              </div>
                            </div>
                            {isActive && isTimeValid && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium"
                              >
                                <Sparkles className="w-3 h-3" />
                                Active Now
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Free Items Section - Horizontal Scroll */}
          {freeItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-friendme" />
                <h3 className="font-semibold text-foreground text-lg">Free Items</h3>
              </div>
              <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
                <div className="flex gap-3" style={{ width: 'max-content' }}>
                  {freeItems.map((item) => {
                    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const isActive = item.days.includes(currentDay);
                    const currentHour = new Date().getHours();
                    const itemStartHour = item.time === 'All Day' ? 0 : parseInt(item.time.split(' - ')[0]?.split(':')[0] || '0');
                    const itemEndHour = item.time === 'All Day' ? 23 : parseInt(item.time.split(' - ')[1]?.split(':')[0] || '23');
                    const isTimeValid = item.time === 'All Day' || (currentHour >= itemStartHour && currentHour < itemEndHour);
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`card-elevated p-4 rounded-2xl border-2 flex-shrink-0 w-72 ${
                          isActive && isTimeValid ? 'border-friendme/50 bg-friendme/5' : 'border-border'
                        }`}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="relative w-full h-28 rounded-xl overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                              <span className="text-3xl">{item.icon}</span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-friendme/90 text-white">
                                {item.discount}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-semibold text-foreground text-base">{item.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{item.time}</span>
                            </div>
                            {isActive && isTimeValid && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-friendme/20 text-friendme text-xs font-medium"
                              >
                                <Sparkles className="w-3 h-3" />
                                Active Now
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="ambiance" className="w-full">
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
                <>
                  <div className="card-elevated p-4">
                    <h3 className="font-semibold text-foreground mb-4">Menu</h3>
                    <div className="space-y-4">
                      {sampleMenuItems.map((item) => (
                        <motion.button
                          key={item.id}
                          onClick={() => handleViewMenuItem(item)}
                          className="w-full text-left border-b border-border pb-4 last:border-0 last:pb-0"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex gap-4">
                            <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-primary/90 backdrop-blur-sm">
                                <Camera className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <div>
                                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                                  <p className="text-xs text-muted-foreground">{item.category}</p>
                                </div>
                                <span className="text-lg font-bold text-primary">${item.price}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                              
                              {/* Ingredients */}
                              <div className="flex flex-wrap gap-1 mb-2">
                                {item.ingredients.slice(0, 3).map((ingredient, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-full bg-muted text-xs text-foreground"
                                  >
                                    {ingredient}
                                  </span>
                                ))}
                                {item.ingredients.length > 3 && (
                                  <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                                    +{item.ingredients.length - 3} more
                                  </span>
                                )}
                              </div>

                              {/* Calories & AR Button */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Calories:</span>
                                <span className="text-xs font-medium text-foreground">{item.calories} kcal</span>
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewMenuItem(item);
                                    setViewMode('ar');
                                  }}
                                  className="ml-auto px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium flex items-center gap-1"
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Sparkles className="w-3 h-3" />
                                  View in AR
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="card-elevated p-4">
                  <h3 className="font-semibold text-foreground mb-3">Menu</h3>
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button
              className="flex-1 h-12 bg-gradient-primary"
              onClick={() => toast.success('Venue saved!')}
            >
              Save Venue
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Item Detail Modal with 3D/AR View */}
      <AnimatePresence>
        {selectedMenuItem && (
          <Dialog open={!!selectedMenuItem} onOpenChange={() => setSelectedMenuItem(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
              <DialogHeader className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl font-bold">{selectedMenuItem.name}</DialogTitle>
                  <button
                    onClick={() => setSelectedMenuItem(null)}
                    className="p-2 rounded-full bg-muted hover:bg-accent transition-colors"
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                </div>
              </DialogHeader>

              <div className="px-6 pb-6 space-y-4">
                {/* View Mode Tabs */}
                <div className="flex gap-2 border-b border-border">
                  <button
                    onClick={() => setViewMode('2d')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === '2d'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Eye className="w-4 h-4 inline mr-2" />
                    View
                  </button>
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === '3d'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Box className="w-4 h-4 inline mr-2" />
                    3D Model
                  </button>
                  <button
                    onClick={() => setViewMode('ar')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'ar'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Camera className="w-4 h-4 inline mr-2" />
                    AR View
                  </button>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                  {viewMode === '2d' && (
                    <motion.div
                      key="2d"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {/* Image */}
                      <div className="relative aspect-video rounded-xl overflow-hidden">
                        <img
                          src={selectedMenuItem.image}
                          alt={selectedMenuItem.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-foreground">{selectedMenuItem.name}</h3>
                            <p className="text-sm text-muted-foreground">{selectedMenuItem.category}</p>
                          </div>
                          <span className="text-2xl font-bold text-primary">${selectedMenuItem.price}</span>
                        </div>

                        <p className="text-foreground">{selectedMenuItem.description}</p>

                        {/* Ingredients */}
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Ingredients</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedMenuItem.ingredients.map((ingredient, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-full bg-muted text-sm text-foreground"
                              >
                                {ingredient}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Nutrition Info */}
                        <div className="p-4 rounded-xl bg-muted">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Calories</span>
                            <span className="text-sm font-semibold text-foreground">{selectedMenuItem.calories} kcal</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {viewMode === '3d' && (
                    <motion.div
                      key="3d"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex flex-col items-center justify-center p-8 relative overflow-hidden">
                        {/* 3D Model Placeholder */}
                        <div className="relative w-full h-full flex items-center justify-center">
                          <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                          }} />
                          <div className="relative z-10 text-center">
                            <Box className="w-24 h-24 mx-auto mb-4 text-primary/50" />
                            <p className="text-lg font-semibold text-foreground mb-2">3D Model View</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              {selectedMenuItem.name}
                            </p>
                            <p className="text-xs text-muted-foreground px-4">
                              In production, this would display an interactive 3D model using Three.js, react-three-fiber, or model-viewer.
                            </p>
                          </div>
                        </div>
                        
                        {/* Controls */}
                        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => toast.info('Rotate model - Use mouse/touch to interact')}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Rotate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => toast.info('Zoom in/out - Pinch or scroll')}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Zoom
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-sm text-foreground">
                          <strong>3D Model:</strong> {selectedMenuItem.arModel}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Interactive 3D model allows you to rotate, zoom, and explore the dish from all angles.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {viewMode === 'ar' && (
                    <motion.div
                      key="ar"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="aspect-square bg-black rounded-xl flex flex-col items-center justify-center p-8 relative overflow-hidden">
                        {/* AR Camera View Placeholder */}
                        <div className="relative w-full h-full flex items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 opacity-20" />
                          <div className="relative z-10 text-center">
                            <Camera className="w-24 h-24 mx-auto mb-4 text-white/50" />
                            <p className="text-lg font-semibold text-white mb-2">AR View</p>
                            <p className="text-sm text-white/80 mb-4">
                              {selectedMenuItem.name}
                            </p>
                            <p className="text-xs text-white/60 px-4 mb-4">
                              Point your camera at a flat surface to place the 3D model in your environment.
                            </p>
                            <div className="flex flex-col gap-2">
                              <Button
                                className="bg-white text-black hover:bg-white/90"
                                onClick={() => toast.info('AR view would activate camera. In production, this uses AR.js, WebXR, or 8th Wall.')}
                              >
                                <Camera className="w-4 h-4 mr-2" />
                                Start AR Experience
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-sm font-semibold text-foreground mb-2">AR Features:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Place the dish in your real environment</li>
                          <li>• View it from different angles</li>
                          <li>• See accurate size and proportions</li>
                          <li>• Share AR experience with friends</li>
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-muted">
                        <p className="text-sm text-foreground mb-2">
                          <strong>AR Model:</strong> {selectedMenuItem.arModel}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          In production, this would use WebXR API, AR.js, 8th Wall, or similar AR framework to overlay the 3D model onto your camera view.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
};

export default VenueDetailPage;
