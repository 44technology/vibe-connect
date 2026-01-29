import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Plus, Video, Radio, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function StreamingPage() {
  const [streams, setStreams] = useState([
    { id: 1, title: 'Live Q&A Session', description: 'Answering student questions', status: 'scheduled', date: '2025-02-05', time: '19:00', viewers: 0 },
    { id: 2, title: 'Diction Class Live', description: 'Real-time pronunciation practice', status: 'live', date: '2025-01-27', time: '18:00', viewers: 24 },
    { id: 3, title: 'AutoCAD Tutorial', description: 'Basic drawing techniques', status: 'ended', date: '2025-01-25', time: '14:00', viewers: 156 },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !date || !time) {
      toast.error('Please fill all fields');
      return;
    }
    const newStream = {
      id: streams.length + 1,
      title,
      description,
      status: 'scheduled' as const,
      date,
      time,
      viewers: 0,
    };
    setStreams([newStream, ...streams]);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setIsDialogOpen(false);
    toast.success('Stream scheduled successfully!');
  };

  const startStream = (id: number) => {
    setStreams(streams.map(s => s.id === id ? { ...s, status: 'live' as const, viewers: Math.floor(Math.random() * 50) } : s));
    toast.success('Stream started!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Streaming</h1>
          <p className="text-muted-foreground mt-2">Schedule and manage live streams</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Stream
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Live Stream</DialogTitle>
              <DialogDescription>Set up a new live streaming session</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Live Q&A Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your stream..."
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
              <Button onClick={handleSubmit} className="w-full">
                Schedule Stream
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {streams.map((stream) => (
          <Card key={stream.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  {stream.title}
                </CardTitle>
                <Badge variant={stream.status === 'live' ? 'destructive' : stream.status === 'scheduled' ? 'default' : 'secondary'}>
                  {stream.status}
                </Badge>
              </div>
              <CardDescription>{stream.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{stream.date} at {stream.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{stream.viewers} viewers</span>
                </div>
                {stream.status === 'scheduled' && (
                  <Button onClick={() => startStream(stream.id)} className="w-full" size="sm">
                    <Radio className="w-4 h-4 mr-2" />
                    Start Stream
                  </Button>
                )}
                {stream.status === 'live' && (
                  <Button variant="destructive" className="w-full" size="sm">
                    <Video className="w-4 h-4 mr-2" />
                    End Stream
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
