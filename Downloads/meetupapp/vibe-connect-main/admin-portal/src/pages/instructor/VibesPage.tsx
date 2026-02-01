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

type VibeTicket = {
  id: number;
  title: string;
  price: number;
  type: 'paid' | 'free';
  available: number;
  sold: number;
};

export default function VibesPage() {
  const [vibes, setVibes] = useState([
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
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  
  // Ticket dialog state
  const [selectedVibeId, setSelectedVibeId] = useState<number | null>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [newTicketPrice, setNewTicketPrice] = useState('');
  const [newTicketType, setNewTicketType] = useState<'paid' | 'free'>('paid');
  const [newTicketAvailable, setNewTicketAvailable] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !date || !time || !location || !maxParticipants) {
      toast.error('Please fill all fields');
      return;
    }
    const newVibe = {
      id: vibes.length + 1,
      title,
      description,
      date,
      time,
      location,
      maxParticipants: parseInt(maxParticipants),
      currentParticipants: 0,
      tickets: [] as VibeTicket[],
    };
    setVibes([newVibe, ...vibes]);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setLocation('');
    setMaxParticipants('');
    setIsDialogOpen(false);
    toast.success('Vibe created successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vibes</h1>
          <p className="text-muted-foreground mt-2">Organize casual meetups and social events</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Vibe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Vibe</DialogTitle>
              <DialogDescription>Organize a casual meetup or social event</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Bowling Night"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your vibe..."
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
                  placeholder="e.g., Main Hall"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  placeholder="e.g., 20"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Create Vibe
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vibes.map((vibe) => (
          <Card key={vibe.id}>
            <CardHeader>
              <CardTitle>{vibe.title}</CardTitle>
              <CardDescription>{vibe.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{vibe.date} at {vibe.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{vibe.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{vibe.currentParticipants}/{vibe.maxParticipants} participants</span>
                  </div>
                </div>
                
                {/* Tickets Section */}
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Tickets ({vibe.tickets?.length || 0})</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedVibeId(vibe.id);
                        setIsTicketDialogOpen(true);
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  {vibe.tickets && vibe.tickets.length > 0 ? (
                    <div className="space-y-2">
                      {vibe.tickets.map((ticket) => (
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
                                setVibes(vibes.map(v => 
                                  v.id === vibe.id 
                                    ? {
                                        ...v,
                                        tickets: v.tickets.map(t => 
                                          t.id === ticket.id 
                                            ? { ...t, type: t.type === 'paid' ? 'free' : 'paid', price: t.type === 'paid' ? 0 : 25 }
                                            : t
                                        )
                                      }
                                    : v
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
                if (!selectedVibeId) return;
                if (!newTicketAvailable || parseInt(newTicketAvailable) <= 0) {
                  toast.error('Please enter a valid number of available tickets');
                  return;
                }
                if (newTicketType === 'paid' && (!newTicketPrice || parseFloat(newTicketPrice) <= 0)) {
                  toast.error('Please enter a valid price for paid tickets');
                  return;
                }
                const selectedVibe = vibes.find(v => v.id === selectedVibeId);
                if (!selectedVibe) return;
                
                const newTicket: VibeTicket = {
                  id: (selectedVibe.tickets?.length || 0) + 1,
                  title: `${selectedVibe.title} Ticket`,
                  price: newTicketType === 'paid' ? parseFloat(newTicketPrice) : 0,
                  type: newTicketType,
                  available: parseInt(newTicketAvailable),
                  sold: 0,
                };
                
                setVibes(vibes.map(v => 
                  v.id === selectedVibeId 
                    ? { ...v, tickets: [...(v.tickets || []), newTicket] }
                    : v
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
