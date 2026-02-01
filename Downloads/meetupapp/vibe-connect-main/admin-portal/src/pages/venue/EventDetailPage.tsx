import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Plus,
  Ticket,
  ToggleLeft,
  ToggleRight,
  Gift
} from 'lucide-react';
import { toast } from 'sonner';

type EventTicket = {
  id: number;
  title: string;
  price: number;
  type: 'paid' | 'free';
  available: number;
  sold: number;
};

// Mock data - In real app, this would come from API
const mockEvents = [
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
];

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventId = parseInt(id || '0');
  
  const eventData = useMemo(() => mockEvents.find(e => e.id === eventId), [eventId]);
  
  // Ticket state
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [newTicketType, setNewTicketType] = useState<'paid' | 'free'>('paid');
  const [newTicketPrice, setNewTicketPrice] = useState('');
  const [newTicketAvailable, setNewTicketAvailable] = useState('');
  
  // Initialize tickets from eventData
  useEffect(() => {
    if (eventData) {
      setTickets(eventData.tickets || []);
    }
  }, [eventData]);
  
  if (!eventData) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate('/events')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
        <div className="text-center py-12 text-muted-foreground">
          Event not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/events')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Events
      </Button>

      {/* Event Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-3xl">{eventData.title}</CardTitle>
            <Badge variant="outline">{eventData.type}</Badge>
          </div>
          <CardDescription>{eventData.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{eventData.date} at {eventData.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{eventData.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{eventData.currentParticipants}/{eventData.maxParticipants} participants</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Tickets */}
      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Tickets</h2>
              <p className="text-muted-foreground mt-1">Manage ticket pricing and availability for this event</p>
            </div>
            <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ticket
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Ticket</DialogTitle>
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
                      if (!newTicketAvailable || parseInt(newTicketAvailable) <= 0) {
                        toast.error('Please enter a valid number of available tickets');
                        return;
                      }
                      if (newTicketType === 'paid' && (!newTicketPrice || parseFloat(newTicketPrice) <= 0)) {
                        toast.error('Please enter a valid price for paid tickets');
                        return;
                      }
                      const newTicket: EventTicket = {
                        id: tickets.length + 1,
                        title: `${eventData.title} Ticket`,
                        price: newTicketType === 'paid' ? parseFloat(newTicketPrice) : 0,
                        type: newTicketType,
                        available: parseInt(newTicketAvailable),
                        sold: 0,
                      };
                      setTickets([...tickets, newTicket]);
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tickets.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No tickets created yet. Click "Add Ticket" to create one.
              </div>
            ) : (
              tickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{ticket.title}</CardTitle>
                      <Badge variant={ticket.type === 'paid' ? 'default' : 'secondary'}>
                        {ticket.type === 'paid' ? 'Paid' : 'Free'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="text-2xl font-bold">
                        {ticket.type === 'paid' ? `$${ticket.price}` : 'Free'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Sold</span>
                      <span className="font-semibold">{ticket.sold} / {ticket.available}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTickets(tickets.map(t => 
                            t.id === ticket.id 
                              ? { ...t, type: t.type === 'paid' ? 'free' : 'paid', price: t.type === 'paid' ? 0 : 50 }
                              : t
                          ));
                          toast.success(`Ticket switched to ${ticket.type === 'paid' ? 'free' : 'paid'}`);
                        }}
                        className="w-full gap-2"
                      >
                        {ticket.type === 'paid' ? (
                          <>
                            <ToggleRight className="w-4 h-4" />
                            Switch to Free
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4" />
                            Switch to Paid
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
