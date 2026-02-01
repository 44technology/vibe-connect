import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Plus, Calendar, MapPin, Users, Ticket, DollarSign, Gift, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

type EventTicket = {
  id: number;
  title: string;
  price: number;
  type: 'paid' | 'free';
  available: number;
  sold: number;
};

export default function EventsPage() {
  const [events, setEvents] = useState([
    { 
      id: 1, 
      title: 'Networking Mixer', 
      description: 'Connect with entrepreneurs and professionals', 
      date: '2025-02-15', 
      time: '18:00', 
      location: 'Conference Center', 
      maxParticipants: 50, 
      currentParticipants: 32,
      type: 'networking',
      tickets: [
        { id: 1, title: 'Networking Mixer Ticket', price: 50, type: 'paid' as const, available: 50, sold: 32 },
      ] as EventTicket[],
    },
    { 
      id: 2, 
      title: 'Workshop: Business Growth', 
      description: 'Learn strategies for scaling your business', 
      date: '2025-02-20', 
      time: '14:00', 
      location: 'Training Room', 
      maxParticipants: 30, 
      currentParticipants: 15,
      type: 'workshop',
      tickets: [
        { id: 2, title: 'Workshop Ticket', price: 75, type: 'paid' as const, available: 30, sold: 15 },
      ] as EventTicket[],
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [eventType, setEventType] = useState<'networking' | 'workshop' | 'seminar' | 'conference'>('networking');
  
  // Ticket dialog state
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [newTicketPrice, setNewTicketPrice] = useState('');
  const [newTicketType, setNewTicketType] = useState<'paid' | 'free'>('paid');
  const [newTicketAvailable, setNewTicketAvailable] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !date || !time || !location || !maxParticipants) {
      toast.error('Please fill all fields');
      return;
    }
    const newEvent = {
      id: events.length + 1,
      title,
      description,
      date,
      time,
      location,
      maxParticipants: parseInt(maxParticipants),
      currentParticipants: 0,
      type: eventType,
      tickets: [] as EventTicket[],
    };
    setEvents([newEvent, ...events]);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setLocation('');
    setMaxParticipants('');
    setEventType('networking');
    setIsDialogOpen(false);
    toast.success('Event created successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground mt-2">Organize professional events and workshops</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Organize a professional event or workshop</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Networking Mixer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select value={eventType} onValueChange={(value) => setEventType(value as 'networking' | 'workshop' | 'seminar' | 'conference')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="e.g., Conference Center"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  placeholder="e.g., 50"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Create Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle>{event.title}</CardTitle>
                <Badge variant="outline">{event.type}</Badge>
              </div>
              <CardDescription>{event.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
                  </div>
                </div>
                
                {/* Tickets Section */}
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Tickets ({event.tickets?.length || 0})</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedEventId(event.id);
                        setIsTicketDialogOpen(true);
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  {event.tickets && event.tickets.length > 0 ? (
                    <div className="space-y-2">
                      {event.tickets.map((ticket) => (
                        <div key={ticket.id} className="p-2 rounded-lg bg-muted/50 border border-border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{ticket.type === 'paid' ? `$${ticket.price}` : 'Free'}</span>
                            <Badge variant={ticket.type === 'paid' ? 'default' : 'secondary'} className="text-xs">
                              {ticket.type}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{ticket.sold} / {ticket.available} sold</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs"
                              onClick={() => {
                                setEvents(events.map(e => 
                                  e.id === event.id 
                                    ? {
                                        ...e,
                                        tickets: e.tickets.map(t => 
                                          t.id === ticket.id 
                                            ? { ...t, type: t.type === 'paid' ? 'free' : 'paid', price: t.type === 'paid' ? 0 : 50 }
                                            : t
                                        )
                                      }
                                    : e
                                ));
                                toast.success(`Ticket switched to ${ticket.type === 'paid' ? 'free' : 'paid'}`);
                              }}
                            >
                              {ticket.type === 'paid' ? (
                                <><ToggleRight className="w-3 h-3 mr-1" />Free</>
                              ) : (
                                <><ToggleLeft className="w-3 h-3 mr-1" />Paid</>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">No tickets yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ticket Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Ticket</DialogTitle>
            <DialogDescription>Add a ticket option for this event</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ticket Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newTicketType === 'paid' ? 'default' : 'outline'}
                  onClick={() => {
                    setNewTicketType('paid');
                    setNewTicketPrice('');
                  }}
                  className="flex-1"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Paid
                </Button>
                <Button
                  type="button"
                  variant={newTicketType === 'free' ? 'default' : 'outline'}
                  onClick={() => {
                    setNewTicketType('free');
                    setNewTicketPrice('');
                  }}
                  className="flex-1"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Free
                </Button>
              </div>
            </div>
            {newTicketType === 'paid' && (
              <div className="space-y-2">
                <Label>Price ($) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder="e.g., 50"
                  value={newTicketPrice}
                  onChange={(e) => setNewTicketPrice(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Available Tickets <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                placeholder="e.g., 50"
                value={newTicketAvailable}
                onChange={(e) => setNewTicketAvailable(e.target.value)}
                min="1"
              />
            </div>
            <Button
              onClick={() => {
                if (!selectedEventId) return;
                if (!newTicketAvailable || parseInt(newTicketAvailable) <= 0) {
                  toast.error('Please enter a valid number of available tickets');
                  return;
                }
                if (newTicketType === 'paid' && (!newTicketPrice || parseFloat(newTicketPrice) <= 0)) {
                  toast.error('Please enter a valid price for paid tickets');
                  return;
                }
                const selectedEvent = events.find(e => e.id === selectedEventId);
                if (!selectedEvent) return;
                
                const newTicket: EventTicket = {
                  id: (selectedEvent.tickets?.length || 0) + 1,
                  title: `${selectedEvent.title} Ticket`,
                  price: newTicketType === 'paid' ? parseFloat(newTicketPrice) : 0,
                  type: newTicketType,
                  available: parseInt(newTicketAvailable),
                  sold: 0,
                };
                
                setEvents(events.map(e => 
                  e.id === selectedEventId 
                    ? { ...e, tickets: [...(e.tickets || []), newTicket] }
                    : e
                ));
                setNewTicketPrice('');
                setNewTicketAvailable('');
                setNewTicketType('paid');
                setIsTicketDialogOpen(false);
                toast.success('Ticket created successfully!');
              }}
              className="w-full"
              disabled={!newTicketAvailable || (newTicketType === 'paid' && !newTicketPrice)}
            >
              Create Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
