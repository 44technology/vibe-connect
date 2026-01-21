import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Clock, DollarSign, Heart, Share2, Shield, UtensilsCrossed, Sparkles, Camera, X } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

const VenueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedARItem, setSelectedARItem] = useState<string | null>(null);
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
                        <motion.div
                          key={item.id}
                          className="border-b border-border pb-4 last:border-0 last:pb-0"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex gap-4">
                            <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              <motion.button
                                onClick={() => handleViewAR(item.id)}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                                whileTap={{ scale: 0.95 }}
                              >
                                <Camera className="w-6 h-6 text-white" />
                              </motion.button>
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
                                  onClick={() => handleViewAR(item.id)}
                                  className="ml-auto px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium flex items-center gap-1"
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Sparkles className="w-3 h-3" />
                                  View in AR
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
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

      {/* AR View Modal */}
      {selectedARItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedARItem(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-full max-w-md bg-card rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">AR View</h3>
              <button
                onClick={() => setSelectedARItem(null)}
                className="p-2 rounded-full bg-muted"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <div className="aspect-square bg-muted rounded-xl flex items-center justify-center mb-4">
              <p className="text-muted-foreground text-center px-4">
                AR view would appear here. In production, this would use AR.js, Three.js, or similar library to display 3D models.
              </p>
            </div>
            <Button
              onClick={() => setSelectedARItem(null)}
              className="w-full"
            >
              Close
            </Button>
          </motion.div>
        </motion.div>
      )}
    </MobileLayout>
  );
};

export default VenueDetailPage;
