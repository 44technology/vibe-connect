import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings, ChevronRight, MapPin, Star, Trophy, Users, Calendar, Heart, Share2, Edit, GraduationCap, X, Music, ExternalLink, Sparkles, Play, Image as ImageIcon, Video as VideoIcon, Check } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import UserAvatar from '@/components/ui/UserAvatar';
import CategoryChip from '@/components/ui/CategoryChip';
import { Coffee, Dumbbell, Heart as HeartIcon, Briefcase, Users as UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS, apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

// Interest options from onboarding (matching IDs) - must match OnboardingPage
const interestOptions = [
  // Coffee & Drinks
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'wine', label: 'Wine', emoji: '🍷' },
  { id: 'cocktails', label: 'Cocktails', emoji: '🍸' },
  { id: 'beer', label: 'Beer', emoji: '🍺' },
  { id: 'tea', label: 'Tea', emoji: '🫖' },
  
  // Sports (Expanded)
  { id: 'tennis', label: 'Tennis', emoji: '🎾' },
  { id: 'basketball', label: 'Basketball', emoji: '🏀' },
  { id: 'soccer', label: 'Soccer', emoji: '⚽' },
  { id: 'volleyball', label: 'Volleyball', emoji: '🏐' },
  { id: 'swimming', label: 'Swimming', emoji: '🏊' },
  { id: 'surfing', label: 'Surfing', emoji: '🏄' },
  { id: 'cycling', label: 'Cycling', emoji: '🚴' },
  { id: 'running', label: 'Running', emoji: '🏃' },
  { id: 'golf', label: 'Golf', emoji: '⛳' },
  { id: 'boxing', label: 'Boxing', emoji: '🥊' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'baseball', label: 'Baseball', emoji: '⚾' },
  { id: 'football', label: 'Football', emoji: '🏈' },
  { id: 'martial-arts', label: 'Martial Arts', emoji: '🥋' },
  { id: 'rock-climbing', label: 'Rock Climbing', emoji: '🧗' },
  { id: 'paddleboarding', label: 'Paddleboarding', emoji: '🏄‍♂️' },
  { id: 'kayaking', label: 'Kayaking', emoji: '🛶' },
  { id: 'diving', label: 'Diving', emoji: '🤿' },
  { id: 'skiing', label: 'Skiing', emoji: '⛷️' },
  { id: 'snowboarding', label: 'Snowboarding', emoji: '🏂' },
  { id: 'skating', label: 'Skating', emoji: '⛸️' },
  { id: 'hiking', label: 'Hiking', emoji: '🥾' },
  { id: 'crossfit', label: 'CrossFit', emoji: '🏋️' },
  { id: 'pilates', label: 'Pilates', emoji: '🧘‍♀️' },
  { id: 'dance-fitness', label: 'Dance Fitness', emoji: '💃' },
  
  // Latin Music & Dance (Miami - Expanded)
  { id: 'reggaeton', label: 'Reggaeton', emoji: '🎵' },
  { id: 'salsa', label: 'Salsa', emoji: '💃' },
  { id: 'bachata', label: 'Bachata', emoji: '💃' },
  { id: 'merengue', label: 'Merengue', emoji: '🎵' },
  { id: 'latin-jazz', label: 'Latin Jazz', emoji: '🎷' },
  { id: 'cumbia', label: 'Cumbia', emoji: '🎶' },
  { id: 'tango', label: 'Tango', emoji: '🕺' },
  { id: 'flamenco', label: 'Flamenco', emoji: '🎸' },
  { id: 'samba', label: 'Samba', emoji: '🥁' },
  { id: 'dembow', label: 'Dembow', emoji: '🎤' },
  { id: 'reggae', label: 'Reggae', emoji: '🎵' },
  { id: 'dancing', label: 'Dancing', emoji: '💃' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'live-music', label: 'Live Music', emoji: '🎸' },
  
  // Cuisine & Food (Expanded)
  { id: 'cooking', label: 'Cooking', emoji: '👨‍🍳' },
  { id: 'italian-food', label: 'Italian Cuisine', emoji: '🍝' },
  { id: 'japanese-food', label: 'Japanese Cuisine', emoji: '🍣' },
  { id: 'mexican-food', label: 'Mexican Cuisine', emoji: '🌮' },
  { id: 'french-food', label: 'French Cuisine', emoji: '🥐' },
  { id: 'thai-food', label: 'Thai Cuisine', emoji: '🍜' },
  { id: 'indian-food', label: 'Indian Cuisine', emoji: '🍛' },
  { id: 'chinese-food', label: 'Chinese Cuisine', emoji: '🥟' },
  { id: 'korean-food', label: 'Korean Cuisine', emoji: '🍲' },
  { id: 'mediterranean-food', label: 'Mediterranean', emoji: '🥙' },
  { id: 'caribbean-food', label: 'Caribbean Cuisine', emoji: '🍹' },
  { id: 'cuban-food', label: 'Cuban Cuisine', emoji: '🥪' },
  { id: 'peruvian-food', label: 'Peruvian Cuisine', emoji: '🍽️' },
  { id: 'brazilian-food', label: 'Brazilian Cuisine', emoji: '🍖' },
  { id: 'spanish-food', label: 'Spanish Cuisine', emoji: '🥘' },
  { id: 'greek-food', label: 'Greek Cuisine', emoji: '🫒' },
  { id: 'seafood', label: 'Seafood', emoji: '🦞' },
  { id: 'bbq', label: 'BBQ', emoji: '🍖' },
  { id: 'vegan', label: 'Vegan', emoji: '🥗' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
  { id: 'foodie', label: 'Foodie', emoji: '🍽️' },
  { id: 'fine-dining', label: 'Fine Dining', emoji: '🍴' },
  { id: 'street-food', label: 'Street Food', emoji: '🌯' },
  
  // Other Interests
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'reading', label: 'Reading', emoji: '📚' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'photography', label: 'Photography', emoji: '📷' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
  { id: 'theater', label: 'Theater', emoji: '🎭' },
  { id: 'comedy', label: 'Comedy', emoji: '😂' },
  { id: 'networking', label: 'Networking', emoji: '💼' },
  { id: 'beach', label: 'Beach', emoji: '🏖️' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌃' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘‍♀️' },
  { id: 'fashion', label: 'Fashion', emoji: '👗' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'entrepreneurship', label: 'Entrepreneurship', emoji: '🚀' },
];

const lookingForOptions = [
  { id: 'friendship', label: 'Friendship', icon: Users, color: 'friendme' },
  { id: 'dating', label: 'Dating', icon: Heart, color: 'loveme' },
  { id: 'networking', label: 'Networking', icon: Briefcase, color: 'connectme' },
];

interface UserStats {
  connections: number;
  meetups: number;
  badges: number;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<'all' | 'photos' | 'videos'>('all');
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video'; index: number } | null>(null);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);

  // Fetch user stats
  const { data: statsData, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { connections: 0, meetups: 0, badges: 0 };
      const response = await apiRequest<{ success: boolean; data: UserStats }>(
        API_ENDPOINTS.USERS.STATS(user.id)
      );
      return response.data;
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
  });

  const stats = [
    { 
      label: 'Connections', 
      value: statsData?.connections ?? 0, 
      icon: Users, 
      route: '/connections' 
    },
    { 
      label: 'Vibes', 
      value: statsData?.meetups ?? 0, 
      icon: Calendar, 
      route: '/my-meetups' 
    },
    { 
      label: 'Badges', 
      value: statsData?.badges ?? 0, 
      icon: Trophy, 
      route: '/badges' 
    },
  ];

  // Map user interests to display format
  const displayInterests = useMemo(() => {
    if (!user?.interests || user.interests.length === 0) return [];
    return user.interests
      .map(interestId => {
        const option = interestOptions.find(opt => opt.id === interestId);
        return option ? { id: option.id, label: option.label, emoji: option.emoji } : null;
      })
      .filter(Boolean) as Array<{ id: string; label: string; emoji: string }>;
  }, [user?.interests]);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setEditForm({
        displayName: user.displayName || '',
        bio: user.bio || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
      setSelectedInterests(user.interests || []);
    }
  }, [user]);

  // Toggle interest selection
  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      } else if (prev.length < 10) {
        return [...prev, interestId];
      }
      return prev;
    });
  };

  // Save interests
  const handleSaveInterests = async () => {
    if (selectedInterests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }
    
    try {
      setIsSaving(true);
      console.log('Saving interests:', selectedInterests);
      
      const response = await apiRequest<{ success: boolean; data: any }>(
        API_ENDPOINTS.USERS.UPDATE,
        {
          method: 'PUT',
          body: JSON.stringify({
            interests: selectedInterests,
          }),
        }
      );
      
      console.log('Response:', response);
      
      if (response.success) {
        await updateUser();
        setShowInterestsModal(false);
        toast.success(`Successfully updated ${selectedInterests.length} interest${selectedInterests.length !== 1 ? 's' : ''}!`);
      } else {
        throw new Error('Failed to update interests');
      }
    } catch (error: any) {
      console.error('Error updating interests:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update interests. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.firstName || !editForm.lastName) {
      toast.error('First name and last name are required');
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest(API_ENDPOINTS.USERS.UPDATE, {
        method: 'PUT',
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          displayName: editForm.displayName || `${editForm.firstName} ${editForm.lastName}`,
          bio: editForm.bio,
        }),
      });

      // Update local user state
      await updateUser({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        displayName: editForm.displayName || `${editForm.firstName} ${editForm.lastName}`,
        bio: editForm.bio,
      });

      toast.success('Profile updated successfully!');
      setShowEditModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="relative">
        {/* Cover gradient */}
        <div className="h-32 bg-gradient-primary" />
        
        {/* Settings button */}
        <motion.button 
          onClick={() => navigate('/settings')}
          className="absolute top-4 right-4 p-2 rounded-full bg-card/20 backdrop-blur-sm"
          whileTap={{ scale: 0.9 }}
        >
          <Settings className="w-5 h-5 text-primary-foreground" />
        </motion.button>

        {/* Profile info */}
        <div className="px-4 -mt-12">
          <div className="flex flex-col items-center">
            <div className="relative">
              <UserAvatar 
                src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300"} 
                alt={user?.displayName || `${user?.firstName} ${user?.lastName}` || 'User'} 
                size="xl"
              />
              <motion.button 
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-md"
                whileTap={{ scale: 0.9 }}
              >
                <Edit className="w-4 h-4" />
              </motion.button>
            </div>
            
            <h1 className="mt-3 text-xl font-bold text-foreground">
              {user?.displayName || `${user?.firstName} ${user?.lastName}` || 'User'}
            </h1>
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Miami, FL</span>
            </div>

            {/* Verification badge */}
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Star className="w-3 h-3 fill-primary" /> Verified
              </span>
            </div>
          </div>

          {/* Stats - Clickable */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.button
                  key={stat.label}
                  className="card-elevated p-4 text-center"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(stat.route)}
                >
                  <Icon className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-xl font-bold text-foreground">
                    {statsLoading ? '-' : stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.button>
              );
            })}
          </div>

          {/* Bio */}
          <div className="mt-6 card-elevated p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground text-lg">About me</h3>
            </div>
            {user?.bio ? (
              <p className="text-foreground leading-relaxed">
                {user.bio}
              </p>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground italic text-sm">
                  No bio yet. Add one to tell others about yourself!
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="ml-2"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            )}
          </div>

          {/* Interests */}
          <div className="mt-4 card-elevated p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Interests</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedInterests(user?.interests || []);
                  setShowInterestsModal(true);
                }}
                className="text-primary hover:text-primary/80"
              >
                <Edit className="w-4 h-4 mr-1" />
                {displayInterests.length > 0 ? 'Edit' : 'Add'}
              </Button>
            </div>
            {displayInterests.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {displayInterests.map((interest) => (
                  <motion.div
                    key={interest.id}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary hover:border-primary/30 hover:shadow-md"
                  >
                    <span className="text-lg leading-none">{interest.emoji}</span>
                    <span className="font-medium">{interest.label}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  No interests added yet. Add interests to connect with like-minded people!
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedInterests(user?.interests || []);
                    setShowInterestsModal(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Add Interests
                </Button>
              </div>
            )}
          </div>

          {/* Looking for */}
          {user?.lookingFor && user.lookingFor.length > 0 && (
            <div className="mt-4 card-elevated p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground text-lg">Looking for</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.lookingFor.map((item: string, index: number) => {
                  const lookingForOption = lookingForOptions.find(opt => opt.id === item);
                  if (!lookingForOption) return null;
                  const Icon = lookingForOption.icon;
                  return (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`chip chip-${lookingForOption.color} px-4 py-2`}
                    >
                      <Icon className="w-4 h-4" /> {lookingForOption.label}
                    </motion.span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spotify Connection */}
          <div className="mt-4 card-elevated p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10">
                  <Music className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Spotify</h3>
              </div>
              {user?.spotifyConnected ? (
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20">
                  Connected
              </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Spotify connection coming soon')}
                  className="border-primary/20"
                >
                  Connect
                </Button>
              )}
            </div>
            
            {user?.spotifyConnected && user.spotifyLastTrack ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-sm text-muted-foreground mb-3 font-medium">Last played</p>
                <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10">
                  {user.spotifyLastTrack.image && (
                    <motion.img
                      src={user.spotifyLastTrack.image}
                      alt={user.spotifyLastTrack.name}
                      className="w-20 h-20 rounded-xl object-cover shadow-lg"
                      whileHover={{ scale: 1.05 }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-base truncate mb-1">
                      {user.spotifyLastTrack.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate mb-1">
                      {user.spotifyLastTrack.artist}
                    </p>
                    {user.spotifyLastTrack.album && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.spotifyLastTrack.album}
                      </p>
                    )}
                    {user.spotifyLastTrack.playedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(user.spotifyLastTrack.playedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                  {user.spotifyLastTrack.url && (
                    <motion.a
                      href={user.spotifyLastTrack.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-primary text-primary-foreground self-start shadow-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ExternalLink className="w-5 h-5" />
                    </motion.a>
                  )}
                </div>
              </motion.div>
            ) : user?.spotifyConnected ? (
              <p className="text-sm text-muted-foreground italic">No recent tracks</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Connect your Spotify account to share what you're listening to
              </p>
            )}
            </div>

          {/* Photos & Videos Gallery */}
          <div className="mt-4 card-elevated p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground text-lg">Photos & Videos</h3>
            </div>
            
            {user?.photos && user.photos.length > 0 ? (
              <div>
                {/* Tabs */}
                <div className="flex gap-2 mb-4 border-b border-border">
                <motion.button
                  onClick={() => setActiveMediaTab('all')}
                  className={`px-4 py-2 font-medium text-sm relative ${
                    activeMediaTab === 'all' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  All
                  {activeMediaTab === 'all' && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeMediaTab"
                    />
                  )}
                </motion.button>
                <motion.button
                  onClick={() => setActiveMediaTab('photos')}
                  className={`px-4 py-2 font-medium text-sm relative ${
                    activeMediaTab === 'photos' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  Photos
                  {activeMediaTab === 'photos' && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeMediaTab"
                    />
                  )}
                </motion.button>
                <motion.button
                  onClick={() => setActiveMediaTab('videos')}
                  className={`px-4 py-2 font-medium text-sm relative ${
                    activeMediaTab === 'videos' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <VideoIcon className="w-4 h-4 inline mr-1" />
                  Videos
                  {activeMediaTab === 'videos' && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeMediaTab"
                    />
                  )}
                </motion.button>
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-3 gap-2">
                {user.photos
                  .filter((url: string) => {
                    if (activeMediaTab === 'photos') return !url.startsWith('data:video');
                    if (activeMediaTab === 'videos') return url.startsWith('data:video');
                    return true; // 'all' shows everything
                  })
                  .map((url: string, index: number) => {
                    const isVideo = url.startsWith('data:video');
                    const allMedia = user.photos || [];
                    const actualIndex = allMedia.indexOf(url);
                    
                    return (
                      <motion.button
                        key={index}
                        onClick={() => setSelectedMedia({ url, type: isVideo ? 'video' : 'image', index: actualIndex })}
                        className="aspect-square rounded-lg overflow-hidden relative group"
                        whileTap={{ scale: 0.95 }}
                      >
                        {isVideo ? (
                          <>
                            <video
                              src={url}
                              className="w-full h-full object-cover"
                              muted
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <Play className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                          </>
                        ) : (
                          <img
                            src={url}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm mb-2">
                  No photos or videos yet
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/settings')}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Add Photos
                </Button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-xl">
              <Share2 className="w-4 h-4 mr-2" /> Share Profile
            </Button>
            <Button 
              onClick={() => setShowEditModal(true)}
              className="flex-1 h-12 rounded-xl bg-gradient-primary"
            >
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </div>

          {/* Quick links */}
          <div className="mt-6 space-y-2 pb-4">
            {[
              { label: 'My Vibes', icon: Calendar, route: '/my-meetups' },
              { label: 'My Classes', icon: GraduationCap, route: '/my-classes' },
              { label: 'Saved Venues', icon: Heart, route: '/discover' },
              { label: 'Social Feed', icon: Users, route: '/social' },
              { label: 'Settings', icon: Settings, route: '/settings' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  className="w-full p-4 rounded-xl bg-card flex items-center justify-between"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(item.route)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-4 bg-background rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
                <motion.button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-full hover:bg-muted"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-foreground" />
                </motion.button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    First Name
                  </label>
                  <Input
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    placeholder="First Name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Last Name
                  </label>
                  <Input
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    placeholder="Last Name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Display Name
                  </label>
                  <Input
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    placeholder="Display Name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-gradient-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Screen Media Viewer */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 p-3 rounded-full bg-black/50 text-white z-10"
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full h-full flex items-center justify-center p-4"
            >
              {selectedMedia.type === 'video' ? (
                <video
                  src={selectedMedia.url.startsWith('data:video;') ? selectedMedia.url.replace('data:video;', '') : selectedMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <img
                  src={selectedMedia.url}
                  alt="Full screen"
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interests Selection Modal */}
      <AnimatePresence>
        {showInterestsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end"
            onClick={() => setShowInterestsModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-card rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Select Interests</h2>
                <motion.button
                  onClick={() => setShowInterestsModal(false)}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full hover:bg-muted"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>

              {/* Selection Counter */}
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Selected: {selectedInterests.length} / 10
                </p>
              </div>

              {/* Interests Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-3 gap-3">
                  {interestOptions.map((option) => {
                    const isSelected = selectedInterests.includes(option.id);
                    const isDisabled = !isSelected && selectedInterests.length >= 10;
                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => toggleInterest(option.id)}
                        disabled={isDisabled}
                        className={`p-4 rounded-2xl border-2 transition-all relative ${
                          isSelected 
                            ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/10 shadow-md' 
                            : isDisabled
                            ? 'border-border bg-muted opacity-50 cursor-not-allowed'
                            : 'border-border bg-card hover:border-primary/30'
                        }`}
                        whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md"
                          >
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </motion.div>
                        )}
                        <span className="text-3xl block mb-1">{option.emoji}</span>
                        <p className="mt-1 font-medium text-xs text-foreground">{option.label}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border">
                <Button
                  onClick={handleSaveInterests}
                  disabled={selectedInterests.length === 0 || isSaving}
                  className="w-full bg-gradient-primary h-12 text-lg font-semibold disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : `Save ${selectedInterests.length} Interest${selectedInterests.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </MobileLayout>
  );
};

export default ProfilePage;
