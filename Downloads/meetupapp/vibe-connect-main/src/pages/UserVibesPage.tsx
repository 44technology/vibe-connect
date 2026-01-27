import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useUser } from '@/hooks/useUsers';
import { useMeetups } from '@/hooks/useMeetups';
import { format } from 'date-fns';

const UserVibesPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { data: user } = useUser(userId);
  const { data: meetups } = useMeetups();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Filter meetups for this user
  const userMeetups = meetups?.filter(m => m.creator?.id === userId || m.attendees?.some((a: any) => a.id === userId)) || [];

  const filteredMeetups = userMeetups.filter(meetup =>
    meetup.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meetup.venue?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingMeetups = filteredMeetups.filter(m => new Date(m.startTime) > new Date());
  const pastMeetups = filteredMeetups.filter(m => new Date(m.startTime) <= new Date());

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            onClick={() => navigate(`/user/${userId}`)}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground">
            {user?.displayName || user?.firstName}'s Vibes
          </h1>
        </div>
        
        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search vibes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upcoming' | 'past')}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="upcoming" className="flex-1">
              Upcoming ({upcomingMeetups.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1">
              Past ({pastMeetups.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3">
            {upcomingMeetups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No upcoming vibes</p>
              </div>
            ) : (
              upcomingMeetups.map((meetup, index) => (
                <motion.div
                  key={meetup.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/meetup/${meetup.id}`)}
                  className="card-elevated p-4 rounded-2xl cursor-pointer"
                >
                  <h3 className="font-semibold text-foreground mb-2">{meetup.title}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(meetup.startTime), 'MMM d, yyyy • h:mm a')}
                    </div>
                    {meetup.venue && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {meetup.venue.name}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {meetup._count?.attendees || 0} attendees
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-3">
            {pastMeetups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No past vibes</p>
              </div>
            ) : (
              pastMeetups.map((meetup, index) => (
                <motion.div
                  key={meetup.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/meetup/${meetup.id}`)}
                  className="card-elevated p-4 rounded-2xl cursor-pointer opacity-75"
                >
                  <h3 className="font-semibold text-foreground mb-2">{meetup.title}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(meetup.startTime), 'MMM d, yyyy • h:mm a')}
                    </div>
                    {meetup.venue && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {meetup.venue.name}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {meetup._count?.attendees || 0} attendees
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </MobileLayout>
  );
};

export default UserVibesPage;
