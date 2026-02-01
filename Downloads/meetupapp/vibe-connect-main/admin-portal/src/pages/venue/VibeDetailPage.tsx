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

type VibeTicket = {
  id: number;
  title: string;
  price: number;
  type: 'paid' | 'free';
  available: number;
  sold: number;
};

// Mock data - In real app, this would come from API
const mockVibes = [
  { 
    id: 1, 
    title: 'Bowling Night', 
    description: 'Join us for a fun bowling session', 
    date: '2025-02-05', 
    time: '19:00', 
    location: 'Main Hall', 
    maxParticipants: 20, 
    currentParticipants: 12,
    tickets: [
      { id: 1, title: 'Bowling Night Ticket', price: 25, type: 'paid' as const, available: 20, sold: 12 },
    ] as VibeTicket[],
  },
  { 
    id: 2, 
    title: 'Karaoke Evening', 
    description: 'Sing your heart out', 
    date: '2025-02-10', 
    time: '20:00', 
    location: 'Event Room', 
    maxParticipants: 30, 
    currentParticipants: 18,
    tickets: [
      { id: 2, title: 'Karaoke Evening Ticket', price: 0, type: 'free' as const, available: 30, sold: 18 },
    ] as VibeTicket[],
  },
];

export default function VibeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const vibeId = parseInt(id || '0');
  
  const vibeData = useMemo(() => mockVibes.find(v => v.id === vibeId), [vibeId]);
  
  // Ticket state
  const [tickets, setTickets] = useState<VibeTicket[]>([]);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [newTicketType, setNewTicketType] = useState<'paid' | 'free'>('paid');
  const [newTicketPrice, setNewTicketPrice] = useState('');
  const [newTicketAvailable, setNewTicketAvailable] = useState('');
  
  // Initialize tickets from vibeData
  useEffect(() => {
    if (vibeData) {
      setTickets(vibeData.tickets || []);
    }
  }, [vibeData]);
  
  if (!vibeData) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate('/vibes')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vibes
        </Button>
        <div className="text-center py-12 text-muted-foreground">
          Vibe not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/vibes')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Vibes
      </Button>

      {/* Vibe Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{vibeData.title}</CardTitle>
          <CardDescription>{vibeData.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{vibeData.date} at {vibeData.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{vibeData.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{vibeData.currentParticipants}/{vibeData.maxParticipants} participants</span>
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
              <p className="text-muted-foreground mt-1">Manage ticket pricing and availability for this vibe</p>
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
                  <DialogDescription>Add a ticket option for this vibe</DialogDescription>
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
                        placeholder="e.g., 25"
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
                      placeholder="e.g., 20"
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
                      const newTicket: VibeTicket = {
                        id: tickets.length + 1,
                        title: `${vibeData.title} Ticket`,
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
                              ? { ...t, type: t.type === 'paid' ? 'free' : 'paid', price: t.type === 'paid' ? 0 : 25 }
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
