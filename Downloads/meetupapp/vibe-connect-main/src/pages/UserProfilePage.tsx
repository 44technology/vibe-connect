import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Trophy, Users, Calendar, Heart, Share2, MessageCircle, Settings, UserPlus, Check, X, Music, ExternalLink, Play, Image as ImageIcon, Video as VideoIcon, Sparkles } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import UserAvatar from '@/components/ui/UserAvatar';
import CategoryChip from '@/components/ui/CategoryChip';
import { Button } from '@/components/ui/button';
import { Coffee, Dumbbell, Heart as HeartIcon, Briefcase, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUsers';
import { useMatches, useCreateMatch, useUpdateMatch } from '@/hooks/useMatches';
import { useCreateDirectChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';

// Interest options from onboarding (for emoji mapping) - must match OnboardingPage
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

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: user, isLoading } = useUser(userId);
  const { data: matches } = useMatches();
  const createMatch = useCreateMatch();
  const updateMatch = useUpdateMatch();
  const createDirectChat = useCreateDirectChat();
  const [activeMediaTab, setActiveMediaTab] = useState<'all' | 'photos' | 'videos'>('all');
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video'; index: number } | null>(null);

  const isOwnProfile = userId === currentUser?.id;

  // Fetch user stats
  const { data: statsData } = useQuery<{ connections: number; meetups: number; badges: number }>({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      if (!userId) return { connections: 0, meetups: 0, badges: 0 };
      const response = await apiRequest<{ success: boolean; data: { connections: number; meetups: number; badges: number } }>(
        API_ENDPOINTS.USERS.STATS(userId)
      );
      return response.data;
    },
    enabled: !!userId,
  });

  // Calculate common interests
  const commonInterests = useMemo(() => {
    if (!currentUser?.interests || !user?.interests || isOwnProfile) return [];
    return currentUser.interests.filter(interest => user.interests?.includes(interest));
  }, [currentUser?.interests, user?.interests, isOwnProfile]);

  // Map user interests to display format with common indicator
  const displayInterests = useMemo(() => {
    if (!user?.interests || user.interests.length === 0) return [];
    return user.interests.map(interestId => {
      const option = interestOptions.find(opt => opt.id === interestId);
      const isCommon = commonInterests.includes(interestId);
      return {
        id: interestId,
        label: option?.label || interestId,
        emoji: option?.emoji || '✨',
        isCommon,
      };
    });
  }, [user?.interests, commonInterests]);

  // Get user connections count from stats
  const userConnectionsCount = statsData?.connections ?? 0;

  // Find existing match with this user
  const existingMatch = matches?.find(m => 
    m.user.id === userId && 
    (m.status === 'PENDING' || m.status === 'ACCEPTED')
  );

  const isConnected = existingMatch?.status === 'ACCEPTED';
  const hasPendingRequest = existingMatch?.status === 'PENDING';
  const isPendingFromThem = hasPendingRequest && !existingMatch.isSender;
  const isPendingFromMe = hasPendingRequest && existingMatch.isSender;

  const handleConnect = async () => {
    if (!userId || !currentUser) {
      toast.error('Please login to connect');
      return;
    }

    if (isPendingFromThem) {
      // Accept their request
      try {
        await updateMatch.mutateAsync({ matchId: existingMatch.id, status: 'ACCEPTED' });
        toast.success('Connection accepted!');
      } catch (error: any) {
        toast.error(error.message || 'Failed to accept connection');
      }
    } else if (!hasPendingRequest) {
      // Send new request
      try {
        await createMatch.mutateAsync(userId);
        toast.success('Connection request sent!');
      } catch (error: any) {
        toast.error(error.message || 'Failed to send connection request');
      }
    }
  };

  const handleMessage = async () => {
    if (!userId || !currentUser) {
      toast.error('Please login to message');
      return;
    }

    if (!isConnected) {
      toast.error('You need to be connected to message');
      return;
    }

    try {
      const chat = await createDirectChat.mutateAsync(userId);
      navigate(`/chat?chatId=${chat.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start chat');
    }
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <p className="text-muted-foreground">Loading user...</p>
        </div>
      </MobileLayout>
    );
  }

  if (!user) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <p className="text-muted-foreground">User not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

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
          <h1 className="text-xl font-bold text-foreground flex-1">{user.displayName || user.name}</h1>
          <div className="flex gap-2">
            <motion.button
              className="p-2 rounded-full bg-muted"
              whileTap={{ scale: 0.9 }}
              onClick={() => toast.info('Share feature coming soon')}
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </motion.button>
            {isOwnProfile && (
              <motion.button
                onClick={() => navigate('/settings')}
                className="p-2 rounded-full bg-muted"
                whileTap={{ scale: 0.9 }}
              >
                <Settings className="w-5 h-5 text-foreground" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="pb-4">
        {/* Cover & Avatar */}
        <div className="relative">
          <div className="h-32 bg-gradient-primary" />
          <div className="px-4 -mt-16">
            <div className="flex flex-col items-center">
              <UserAvatar 
                src={user.avatar} 
                alt={user.name} 
                size="xl"
              />
              <h2 className="mt-3 text-xl font-bold text-foreground">
                {user.displayName || `${user.firstName} ${user.lastName}`}
              </h2>
              {user.location && (
                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{user.location}</span>
                </div>
              )}
              {user.isVerified && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <Star className="w-3 h-3 fill-primary" /> Verified
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 space-y-6 mt-6">
          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={handleMessage}
                disabled={!isConnected || createDirectChat.isPending}
              >
                <MessageCircle className="w-4 h-4 mr-2" /> 
                {createDirectChat.isPending ? 'Opening...' : 'Message'}
              </Button>
              {isConnected ? (
                <Button
                  className="flex-1 h-12 bg-muted text-foreground"
                  disabled
                >
                  <Check className="w-4 h-4 mr-2" /> Connected
                </Button>
              ) : isPendingFromMe ? (
                <Button
                  className="flex-1 h-12 bg-muted text-foreground"
                  disabled
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Pending
                </Button>
              ) : isPendingFromThem ? (
                <Button
                  className="flex-1 h-12 bg-gradient-primary"
                  onClick={handleConnect}
                  disabled={updateMatch.isPending}
                >
                  <Check className="w-4 h-4 mr-2" /> 
                  {updateMatch.isPending ? 'Accepting...' : 'Accept Request'}
                </Button>
              ) : (
                <Button
                  className="flex-1 h-12 bg-gradient-primary"
                  onClick={handleConnect}
                  disabled={createMatch.isPending}
                >
                  <UserPlus className="w-4 h-4 mr-2" /> 
                  {createMatch.isPending ? 'Sending...' : 'Connect'}
                </Button>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <motion.button
              onClick={() => navigate(`/user/${userId}/connections`)}
              className="card-elevated p-4 text-center"
              whileTap={{ scale: 0.95 }}
            >
              <Users className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xl font-bold text-foreground">
                {userConnectionsCount}
              </p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </motion.button>
            <motion.button
              onClick={() => navigate(`/user/${userId}/vibes`)}
              className="card-elevated p-4 text-center"
              whileTap={{ scale: 0.95 }}
            >
              <Calendar className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xl font-bold text-foreground">-</p>
              <p className="text-xs text-muted-foreground">Vibes</p>
            </motion.button>
            <motion.button
              onClick={() => navigate(`/user/${userId}/badges`)}
              className="card-elevated p-4 text-center"
              whileTap={{ scale: 0.95 }}
            >
              <Trophy className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xl font-bold text-foreground">3</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </motion.button>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="card-elevated p-4">
              <h3 className="font-semibold text-foreground mb-2">About me</h3>
              <p className="text-muted-foreground text-sm">{user.bio}</p>
            </div>
          )}

          {/* Interests */}
          <div className="mt-4 card-elevated p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Interests</h3>
              </div>
              {!isOwnProfile && commonInterests.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30"
                >
                  <span className="text-lg">⭐</span>
                  <span className="text-primary text-xs font-semibold">
                    {commonInterests.length} common
                  </span>
                </motion.div>
              )}
            </div>
            {displayInterests.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {displayInterests.map((interest) => (
                  <motion.div
                    key={interest.id}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      interest.isCommon
                        ? 'bg-gradient-to-r from-primary/25 via-primary/15 to-primary/10 border-2 border-primary/40 text-primary shadow-lg shadow-primary/10'
                        : 'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary hover:border-primary/30 hover:shadow-md'
                    }`}
                  >
                    <span className="text-lg leading-none">{interest.emoji}</span>
                    <span className="font-medium">{interest.label}</span>
                    {interest.isCommon && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -top-1 -right-1"
                      >
                        <div className="p-1 rounded-full bg-primary shadow-md">
                          <Sparkles className="w-2.5 h-2.5 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  No interests added yet
                </p>
              </div>
            )}
          </div>

          {/* Looking for */}
          {user.lookingFor && user.lookingFor.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Looking for</h3>
              <div className="flex gap-2">
                {user.lookingFor.map((item: string, index: number) => (
                  <span
                    key={index}
                    className="chip chip-friendme"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Spotify Connection */}
          <div className="card-elevated p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10">
                  <Music className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Spotify</h3>
              </div>
              {user.spotifyConnected ? (
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
            
            {user.spotifyConnected && user.spotifyLastTrack ? (
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
            ) : user.spotifyConnected ? (
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
            
            {user.photos && user.photos.length > 0 ? (
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
                <p className="text-muted-foreground text-sm">
                  No photos or videos yet
                </p>
              </div>
            )}
          </div>

          {/* Joined Date */}
          {user.createdAt && (
            <div className="text-center text-sm text-muted-foreground">
              Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

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
    </MobileLayout>
  );
};

export default UserProfilePage;
