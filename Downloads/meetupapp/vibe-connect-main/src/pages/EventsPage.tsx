import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, MapPin, Users, Ticket, Search, Filter, ArrowRight } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useMeetups } from '@/hooks/useMeetups';
import { format } from 'date-fns';

export default function EventsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all');
  
  // Fetch events (type: 'event')
  const { data: meetupsData, isLoading } = useMeetups({ type: 'event' });
  
  const events = meetupsData?.data || [];
  
  // Filter events based on tab
  const filteredEvents = events.filter((event: any) => {
    const matchesSearch = !searchQuery || 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (activeTab === 'upcoming') {
      return new Date(event.startTime) > new Date();
    }
    if (activeTab === 'past') {
      return new Date(event.startTime) <= new Date();
    }
    return true;
  });

  return (
    <MobileLayout>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border safe-top">
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Events</h1>
                <p className="text-sm text-muted-foreground">Discover professional events</p>
              </div>
              <Button
                onClick={() => navigate('/create-event')}
                className="rounded-full bg-gradient-primary"
                size="icon"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Events List */}
        <div className="px-4 pt-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center">
                <Ticket className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No events found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery ? 'Try a different search' : 'Be the first to create an event!'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => navigate('/create-event')}
                    className="bg-gradient-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                )}
              </div>
            </div>
          ) : (
            filteredEvents.map((event: any, index: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  <CardContent className="p-0">
                    {/* Event Image */}
                    <div className="relative h-48 w-full bg-gradient-to-br from-primary/20 to-secondary/20">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Ticket className="w-16 h-16 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-background/90">
                          Event
                        </Badge>
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(event.startTime), 'MMM dd, yyyy • h:mm a')}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        )}
                        {event.maxAttendees && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>
                              {event.currentAttendees || 0} / {event.maxAttendees} attendees
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-2">
                          {event.isFree ? (
                            <Badge variant="secondary">Free</Badge>
                          ) : (
                            <Badge variant="default">
                              ${event.pricePerPerson || 0}
                            </Badge>
                          )}
                          {event.category && (
                            <Badge variant="outline">{event.category}</Badge>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          View Details
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
