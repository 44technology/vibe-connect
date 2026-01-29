import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function VibesPage() {
  const [vibes, setVibes] = useState([
    { id: 1, title: 'Bowling Night', description: 'Join us for a fun bowling session', date: '2025-02-05', time: '19:00', location: 'Main Hall', maxParticipants: 20, currentParticipants: 12 },
    { id: 2, title: 'Karaoke Evening', description: 'Sing your heart out', date: '2025-02-10', time: '20:00', location: 'Event Room', maxParticipants: 30, currentParticipants: 18 },
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
          <h1 className="text-3xl font-bold text-foreground">Create Vibe</h1>
          <p className="text-muted-foreground mt-2">Organize events and meetups</p>
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
              <DialogDescription>Organize an event or meetup</DialogDescription>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
