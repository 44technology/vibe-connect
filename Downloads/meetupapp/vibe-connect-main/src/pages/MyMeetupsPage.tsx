import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import UserAvatar from '@/components/ui/UserAvatar';
import { useMeetups } from '@/hooks/useMeetups';
import { useAuth } from '@/contexts/AuthContext';

const upcomingMeetups = [
  {
    id: '1',
    title: 'Saturday Morning Coffee',
    venue: 'Panther Coffee, Wynwood',
    date: 'Jan 25, 2024',
    time: '10:00 AM',
    attendees: 4,
    maxAttendees: 6,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    isHost: true,
  },
  {
    id: '2',
    title: 'Beach Volleyball',
    venue: 'South Beach',
    date: 'Jan 27, 2024',
    time: '4:00 PM',
    attendees: 8,
    maxAttendees: 12,
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
    isHost: false,
  },
];

const pastMeetups = [
  {
    id: '3',
    title: 'Yoga in the Park',
    venue: 'Bayfront Park',
    date: 'Jan 15, 2024',
    time: '8:00 AM',
    attendees: 10,
    maxAttendees: 15,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    isHost: false,
  },
  {
    id: '4',
    title: 'Networking Brunch',
    venue: 'Zuma Miami',
    date: 'Jan 10, 2024',
    time: '11:00 AM',
    attendees: 6,
    maxAttendees: 8,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    isHost: true,
  },
];

const MeetupItem = ({ meetup }: { meetup: typeof upcomingMeetups[0] }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      className="card-elevated overflow-hidden cursor-pointer"
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/meetup/${meetup.id}`)}
    >
      <div className="relative h-32">
        <img src={meetup.image} alt={meetup.title} className="w-full h-full object-cover" />
        {meetup.isHost ? (
          <span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            Host
          </span>
        ) : (
          <span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
            Guest
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground">{meetup.title}</h3>
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{meetup.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{meetup.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{meetup.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{meetup.attendees}/{meetup.maxAttendees} attending</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MyMeetupsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch user's meetups
  const { data: allMeetups, isLoading, error } = useMeetups();
  
  // Filter meetups by user (created or joined)
  const userMeetups = allMeetups?.filter(meetup => {
    if (!user?.id) return false;
    // Check if user is creator
    if (meetup.creator?.id === user.id) return true;
    // Check if user is a member
    if (meetup.members?.some(m => m.user?.id === user.id)) return true;
    return false;
  }) || [];
  
  console.log('User meetups:', userMeetups);
  console.log('All meetups:', allMeetups);
  console.log('User:', user);
  
  // Separate upcoming and past meetups
  const now = new Date();
  const upcomingMeetups = userMeetups.filter(meetup => {
    if (!meetup.startTime) return false;
    const startTime = new Date(meetup.startTime);
    return startTime >= now;
  }).map(meetup => ({
    id: meetup.id,
    title: meetup.title || 'Untitled Vibe',
    venue: meetup.venue?.name || meetup.location || 'Location TBD',
    date: meetup.startTime ? new Date(meetup.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    time: meetup.startTime ? new Date(meetup.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'TBD',
    attendees: meetup._count?.members || meetup.members?.length || 0,
    maxAttendees: meetup.maxAttendees || 10,
    image: meetup.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    isHost: meetup.creator?.id === user?.id,
  }));
  
  const pastMeetups = userMeetups.filter(meetup => {
    if (!meetup.startTime) return false;
    const startTime = new Date(meetup.startTime);
    return startTime < now;
  }).map(meetup => ({
    id: meetup.id,
    title: meetup.title || 'Untitled Vibe',
    venue: meetup.venue?.name || meetup.location || 'Location TBD',
    date: meetup.startTime ? new Date(meetup.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    time: meetup.startTime ? new Date(meetup.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'TBD',
    attendees: meetup._count?.members || meetup.members?.length || 0,
    maxAttendees: meetup.maxAttendees || 10,
    image: meetup.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    isHost: meetup.creator?.id === user?.id,
  }));

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            onClick={() => navigate('/profile')}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground">My Vibes</h1>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Tabs defaultValue="upcoming" className="mt-2">
          <TabsList className="grid w-full grid-cols-2 bg-muted rounded-xl p-1 h-12">
            <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Error loading vibes</p>
                <p className="text-xs text-muted-foreground mt-2">{String(error)}</p>
              </div>
            ) : upcomingMeetups.length > 0 ? (
              upcomingMeetups.map((meetup) => (
                <MeetupItem key={meetup.id} meetup={meetup} />
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No upcoming vibes</p>
                {allMeetups && allMeetups.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Found {allMeetups.length} total meetups, but none match your filters
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : pastMeetups.length > 0 ? (
              pastMeetups.map((meetup) => (
                <MeetupItem key={meetup.id} meetup={meetup} />
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No past vibes</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </MobileLayout>
  );
};

export default MyMeetupsPage;
