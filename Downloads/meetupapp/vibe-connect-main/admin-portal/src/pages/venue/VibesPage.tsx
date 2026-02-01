import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Plus, Calendar, MapPin, Users, Ticket } from 'lucide-react';
import { toast } from 'sonner';

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
          <Card 
            key={vibe.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/vibes/${vibe.id}`)}
          >
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
                
                {/* Tickets Preview */}
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Tickets ({vibe.tickets?.length || 0})</span>
                  </div>
                  {vibe.tickets && vibe.tickets.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {vibe.tickets.slice(0, 2).map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {ticket.type === 'paid' ? `$${ticket.price}` : 'Free'}
                          </span>
                          <span className="text-muted-foreground">
                            {ticket.sold} / {ticket.available} sold
                          </span>
                        </div>
                      ))}
                      {vibe.tickets.length > 2 && (
                        <p className="text-xs text-muted-foreground">+{vibe.tickets.length - 2} more</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
