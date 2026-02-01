import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Calendar, Heart, Share2, User, DollarSign, Lock, Globe, Tag, Sparkles, MessageCircle, Edit, Trash2, Save, X, Ticket, QrCode } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import UserAvatar from '@/components/ui/UserAvatar';
import { useMeetup, useJoinMeetup, useUpdateMeetup, useDeleteMeetup } from '@/hooks/useMeetups';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useCreateTicketForMeetup } from '@/hooks/useTickets';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Sample campaigns for meetups
const sampleCampaigns = [
  {
    id: 'campaign-1',
    title: 'Early Bird Special',
    description: 'Join before 24 hours and get 20% off on your first drink',
    discount: '20% OFF',
    icon: '🎉',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    time: 'All Day',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  {
    id: 'campaign-2',
    title: 'Group Discount',
    description: 'Bring 3+ friends and everyone gets 15% off',
    discount: '15% OFF',
    icon: '👥',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    time: 'All Day',
    days: ['Saturday', 'Sunday'],
  },
  {
    id: 'campaign-3',
    title: 'Student Discount',
    description: 'Show your student ID and get 25% off',
    discount: '25% OFF',
    icon: '🎓',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    time: 'All Day',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
];

const MeetupDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: meetup, isLoading, error } = useMeetup(id || '');
  const joinMeetup = useJoinMeetup();
  const updateMeetup = useUpdateMeetup();
  const deleteMeetup = useDeleteMeetup();
  const createTicket = useCreateTicketForMeetup();
  const { trackJoin } = usePersonalization();
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any>(null);
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    pricePerPerson: 0,
    maxAttendees: 10,
  });
  
  // Check if user is the host
  const isHost = user && meetup && (meetup.creator?.id === user.id || meetup.host?.id === user.id);

  // Initialize edit data when meetup loads
  useEffect(() => {
    if (meetup && !isEditing) {
      setEditData({
        title: meetup.title || '',
        description: meetup.description || '',
        pricePerPerson: meetup.pricePerPerson || 0,
        maxAttendees: meetup.maxAttendees || 10,
      });
    }
  }, [meetup, isEditing]);

  // Edit handlers
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset edit data to original values
    if (meetup) {
      setEditData({
        title: meetup.title || '',
        description: meetup.description || '',
        pricePerPerson: meetup.pricePerPerson || 0,
        maxAttendees: meetup.maxAttendees || 10,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!id || !editData.title.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateMeetup.mutateAsync({
        id,
        data: {
          title: editData.title,
          description: editData.description,
          pricePerPerson: editData.pricePerPerson,
          maxAttendees: editData.maxAttendees,
        },
      });
      setIsEditing(false);
      toast.success('Meetup updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update meetup');
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteMeetup.mutateAsync(id);
      toast.success('Meetup deleted successfully');
      navigate('/home');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete meetup');
    }
  };

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

  // Check if meetup details should be revealed (2 hours before)
  const shouldRevealDetails = () => {
    if (!isBlindMeet) return true;
    const now = new Date();
    const twoHoursBefore = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);
    return now >= twoHoursBefore;
  };

  const revealDetails = shouldRevealDetails();

  const handleJoin = async () => {
    if (!meetup || !id) {
      toast.error('Meetup not found');
      return;
    }

    try {
      await joinMeetup.mutateAsync({ meetupId: id, status: 'going' });
      
      // Track for personalization
      if (user) {
        trackJoin(meetup);
      }
      
      // Create ticket with QR code
      try {
        const ticket = await createTicket.mutateAsync(id);
        setCreatedTicket(ticket);
        setShowTicketDialog(true);
      } catch (ticketError: any) {
        // Ticket creation failed, but join succeeded
        console.warn('Ticket creation failed:', ticketError);
        toast.success('Joined the vibe!');
        navigate('/home');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to join vibe');
    }
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
            {isHost && (
              <>
                <motion.button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 rounded-full bg-muted"
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit className="w-5 h-5 text-foreground" />
                </motion.button>
                <motion.button
                  onClick={() => setShowDeleteDialog(true)}
                  className="p-2 rounded-full bg-muted"
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-5 h-5 text-destructive" />
                </motion.button>
              </>
            )}
            <motion.button
              className="p-2 rounded-full bg-muted"
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </motion.button>
            {!isHost && (
              <motion.button
                className="p-2 rounded-full bg-muted"
                whileTap={{ scale: 0.9 }}
              >
                <Heart className="w-5 h-5 text-foreground" />
              </motion.button>
            )}
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
              {isBlindMeet && !revealDetails ? (
                <>
                  <h1 className="text-2xl font-bold text-card mb-2 blur-sm select-none">Mystery Vibe</h1>
                  <span className="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-card text-sm font-medium">
                    ???
                  </span>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-card mb-2">{meetup.title}</h1>
                  {meetup.category && (
                    <span className="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-card text-sm font-medium">
                      {meetup.category}
                    </span>
                  )}
                </>
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
          {isEditing ? (
            <div className="card-elevated p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Title
                </label>
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  placeholder="Vibe title"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Description
                </label>
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  placeholder="Describe your vibe..."
                  className="w-full min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Price per Person ($)
                  </label>
                  <Input
                    type="number"
                    value={editData.pricePerPerson}
                    onChange={(e) => setEditData({ ...editData, pricePerPerson: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Max Attendees
                  </label>
                  <Input
                    type="number"
                    value={editData.maxAttendees}
                    onChange={(e) => setEditData({ ...editData, maxAttendees: parseInt(e.target.value) || 10 })}
                    placeholder="10"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={updateMeetup.isPending || !editData.title.trim()}
                  className="flex-1 bg-gradient-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMeetup.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          ) : (
            meetup.description && (
              <div className="card-elevated p-4">
                <p className="text-foreground whitespace-pre-wrap">{meetup.description}</p>
              </div>
            )
          )}

          {/* Campaigns & Offers */}
          {sampleCampaigns.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground text-lg">Campaigns & Offers</h3>
              </div>
              <div className="space-y-3">
                {sampleCampaigns.map((campaign) => {
                  const isActive = campaign.days.includes(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
                  const currentHour = new Date().getHours();
                  const campaignStartHour = campaign.time === 'All Day' ? 0 : parseInt(campaign.time.split(' - ')[0]?.split(':')[0] || '0');
                  const campaignEndHour = campaign.time === 'All Day' ? 23 : parseInt(campaign.time.split(' - ')[1]?.split(':')[0] || '23');
                  const isTimeValid = campaign.time === 'All Day' || (currentHour >= campaignStartHour && currentHour < campaignEndHour);
                  
                  return (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`card-elevated p-4 rounded-2xl border-2 ${
                        isActive && isTimeValid ? 'border-primary/50 bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                            <span className="text-2xl">{campaign.icon}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-foreground">{campaign.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              campaign.discount.includes('%')
                                ? 'bg-primary/20 text-primary'
                                : 'bg-friendme/20 text-friendme'
                            }`}>
                              {campaign.discount}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{campaign.description}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{campaign.time}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{campaign.days.join(', ')}</span>
                            </div>
                          </div>
                          {isActive && isTimeValid && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium"
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

            {meetup.venue?.id ? (
              <motion.button
                onClick={() => navigate(`/venue/${meetup.venue.id}`)}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-muted text-left"
                whileTap={{ scale: 0.98 }}
              >
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Location</p>
                  {isBlindMeet && !revealDetails ? (
                    <>
                      <p className="font-medium text-foreground blur-sm select-none">Secret Location</p>
                      <p className="text-xs text-primary mt-1">🔒 Revealed 2 hours before event</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-foreground">{venueName}</p>
                      {venueAddress && venueAddress !== venueName && (
                        <p className="text-sm text-muted-foreground">{venueAddress}</p>
                      )}
                      <p className="text-xs text-primary mt-1">Tap to view venue details</p>
                    </>
                  )}
                </div>
              </motion.button>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
                <MapPin className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Location</p>
                  {isBlindMeet && !revealDetails ? (
                    <>
                      <p className="font-medium text-foreground blur-sm select-none">Secret Location</p>
                      <p className="text-xs text-primary mt-1">🔒 Revealed 2 hours before event</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-foreground">{venueName}</p>
                      {venueAddress && venueAddress !== venueName && (
                        <p className="text-sm text-muted-foreground">{venueAddress}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {isEditing ? (
              <div className="card-elevated p-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Attendees</p>
                <p className="text-foreground">
                  {attendeeCount} / {editData.maxAttendees} people
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max attendees updated above
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
                <Users className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Attendees</p>
                  <p className="font-medium text-foreground">
                    {attendeeCount} / {maxAttendees} people
                  </p>
                </div>
              </div>
            )}
            
            {/* Price Info */}
            {meetup.pricePerPerson !== undefined && meetup.pricePerPerson !== null && meetup.pricePerPerson > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
                <DollarSign className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Price per Person</p>
                  <p className="font-medium text-foreground">
                    ${isEditing ? editData.pricePerPerson : meetup.pricePerPerson}
                  </p>
                </div>
              </div>
            )}
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
          <div className="space-y-3 pt-4">
            {isHost ? (
              <>
                {isEditing ? (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-12"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={updateMeetup.isPending || !editData.title.trim()}
                      className="flex-1 h-12 bg-gradient-primary"
                    >
                      {updateMeetup.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={handleStartEdit}
                      className="w-full h-12 bg-gradient-primary"
                    >
                      <Edit className="w-5 h-5 mr-2" />
                      Edit Vibe
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-12 flex items-center justify-center gap-2"
                      onClick={() => navigate(`/chat?meetupId=${id}`)}
                    >
                      <MessageCircle className="w-5 h-5" />
                      Open Chat
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-12 flex items-center justify-center gap-2"
                      onClick={() => navigate('/home')}
                    >
                      Back to Home
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="flex gap-3">
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
                
                {/* Chat Button */}
                <Button
                  variant="outline"
                  className="w-full h-12 flex items-center justify-center gap-2"
                  onClick={() => {
                    navigate(`/chat?meetupId=${id}`);
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Open Chat
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Meetup</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this meetup? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMeetup.isPending}
              className="flex-1 bg-destructive text-destructive-foreground"
            >
              {deleteMeetup.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket QR Code Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="max-w-md mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Your Ticket
            </DialogTitle>
            <DialogDescription>
              Show this QR code at the event entrance
            </DialogDescription>
          </DialogHeader>
          
          {createdTicket && (
            <div className="space-y-6 py-4">
              {/* Ticket Number */}
              <div className="text-center pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground mb-1">Ticket Number</p>
                <p className="text-xl font-bold text-foreground">{createdTicket.ticketNumber}</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="w-64 h-64 bg-white rounded-2xl p-4 border-4 border-primary/20 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <QrCode className="w-48 h-48 mx-auto text-foreground" />
                    <p className="text-xs font-mono text-muted-foreground break-all">{createdTicket.qrCode}</p>
                  </div>
                </div>
              </div>

              {/* Event Info */}
              {createdTicket.meetup && (
                <div className="p-4 rounded-xl bg-muted space-y-2">
                  <p className="text-sm font-semibold text-foreground">{createdTicket.meetup.title}</p>
                  {createdTicket.meetup.startTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">
                        {format(new Date(createdTicket.meetup.startTime), 'EEEE, MMMM d, yyyy • h:mm a')}
                      </span>
                    </div>
                  )}
                  {createdTicket.meetup.venue && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{createdTicket.meetup.venue.name}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTicketDialog(false);
                    navigate(`/ticket/${createdTicket.id}`);
                  }}
                  className="flex-1"
                >
                  View Full Ticket
                </Button>
                <Button
                  onClick={() => {
                    setShowTicketDialog(false);
                    navigate('/home');
                  }}
                  className="flex-1 bg-gradient-primary"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default MeetupDetailPage;
