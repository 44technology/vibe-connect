import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Trophy, Users, Calendar, Heart, Share2, MessageCircle, Settings, UserPlus, Check, X } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import UserAvatar from '@/components/ui/UserAvatar';
import CategoryChip from '@/components/ui/CategoryChip';
import { Button } from '@/components/ui/button';
import { Coffee, Dumbbell, Heart as HeartIcon, Briefcase, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUsers';
import { useMatches, useCreateMatch, useUpdateMatch } from '@/hooks/useMatches';
import { useCreateDirectChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: user, isLoading } = useUser(userId);
  const { data: matches } = useMatches();
  const createMatch = useCreateMatch();
  const updateMatch = useUpdateMatch();
  const createDirectChat = useCreateDirectChat();

  const isOwnProfile = userId === currentUser?.id;

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
              <p className="text-xl font-bold text-foreground">-</p>
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
              <p className="text-xl font-bold text-foreground">-</p>
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
          {user.interests && user.interests.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

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

          {/* Joined Date */}
          {user.createdAt && (
            <div className="text-center text-sm text-muted-foreground">
              Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default UserProfilePage;
