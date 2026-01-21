import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Calendar, Heart, Share2, User, DollarSign, Lock, Globe } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';
import { useMeetup } from '@/hooks/useMeetups';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const MeetupDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: meetup, isLoading, error } = useMeetup(id || '');

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </MobileLayout>
    );
  }

  if (error || !meetup) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <p className="text-muted-foreground">Meetup not found</p>
          <Button onClick={() => navigate('/home')} className="mt-4">
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  // Format data from backend
  const host = meetup.creator;
  const hostName = host?.displayName || `${host?.firstName || ''} ${host?.lastName || ''}`.trim() || 'Unknown';
  const hostAvatar = host?.avatar;
  const isBlindMeet = meetup.isBlindMeet || false;
  const startTime = new Date(meetup.startTime);
  const dateStr = startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const venueName = meetup.venue?.name || meetup.location || 'Location TBD';
  const venueAddress = meetup.venue?.address || meetup.location || '';
  const attendees = meetup.members || [];
  const attendeeCount = meetup._count?.members || attendees.length || 0;
  const maxAttendees = meetup.maxAttendees || 10;

  const handleJoin = () => {
    toast.success('Joined the vibe!');
    navigate('/home');
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
          <h1 className="text-xl font-bold text-foreground">Vibe Details</h1>
          <div className="flex gap-2 ml-auto">
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
        {meetup.image && (
          <div className="relative h-64 w-full">
            <img src={meetup.image} alt={meetup.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-2xl font-bold text-card mb-2">{meetup.title}</h1>
              {meetup.category && (
                <span className="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-card text-sm font-medium">
                  {meetup.category}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="px-4 space-y-6 mt-6">
          {/* Host Info */}
          {!isBlindMeet && (
            <motion.button
              onClick={() => navigate(`/user/${host?.id || ''}`)}
              className="w-full card-elevated p-4 text-left"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <UserAvatar src={hostAvatar} alt={hostName} size="md" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Hosted by</p>
                  <p className="font-semibold text-foreground">{hostName}</p>
                </div>
              </div>
            </motion.button>
          )}
          {isBlindMeet && (
            <div className="w-full card-elevated p-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/30">
                  {hostAvatar ? (
                    <>
                      <img 
                        src={hostAvatar} 
                        alt="Host" 
                        className="w-full h-full object-cover scale-110"
                        style={{ filter: 'blur(8px)' }}
                      />
                      <div className="absolute inset-0 bg-primary/30 rounded-full backdrop-blur-sm" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Hosted by</p>
                  <p className="font-semibold text-foreground">Anonymous</p>
                  <p className="text-xs text-muted-foreground mt-1">🎭 This is a blind vibe</p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {meetup.description && (
            <div className="card-elevated p-4">
              <p className="text-foreground whitespace-pre-wrap">{meetup.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium text-foreground">{dateStr} at {timeStr}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
              <MapPin className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">{venueName}</p>
                {venueAddress && venueAddress !== venueName && (
                  <p className="text-sm text-muted-foreground">{venueAddress}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
              <Users className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Attendees</p>
                <p className="font-medium text-foreground">
                  {attendeeCount} / {maxAttendees} people
                </p>
              </div>
            </div>
          </div>

          {/* Attendees */}
          {attendees.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                Attendees {!isBlindMeet ? `(${attendees.length})` : `(${attendees.length} mystery attendees)`}
              </h3>
              {!isBlindMeet ? (
                <div className="flex flex-wrap gap-2">
                  {attendees.map((member) => {
                    const memberUser = member.user;
                    const memberName = memberUser?.displayName || `${memberUser?.firstName || ''} ${memberUser?.lastName || ''}`.trim() || 'Unknown';
                    const memberAvatar = memberUser?.avatar;
                    return (
                      <motion.button
                        key={member.id}
                        onClick={() => navigate(`/user/${memberUser?.id || ''}`)}
                        className="flex items-center gap-2 p-2 rounded-xl bg-muted hover:bg-accent transition-colors"
                        whileTap={{ scale: 0.95 }}
                      >
                        <UserAvatar src={memberAvatar} alt={memberName} size="sm" />
                        <span className="text-sm font-medium text-foreground">{memberName}</span>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {attendees.map((member, index) => {
                    const memberAvatar = member.user?.avatar;
                    return (
                      <div
                        key={member.id || index}
                        className="flex items-center gap-2 p-2 rounded-xl bg-muted"
                      >
                        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/30">
                          {memberAvatar ? (
                            <>
                              <img 
                                src={memberAvatar} 
                                alt="Attendee" 
                                className="w-full h-full object-cover scale-110"
                                style={{ filter: 'blur(6px)' }}
                              />
                              <div className="absolute inset-0 bg-primary/30 rounded-full backdrop-blur-sm" />
                            </>
                          ) : (
                            <div className="w-full h-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Anonymous</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => navigate('/home')}
            >
              Back
            </Button>
            <Button
              onClick={handleJoin}
              className="flex-1 h-12 bg-gradient-primary"
            >
              Join Vibe
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MeetupDetailPage;
