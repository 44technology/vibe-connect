import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Plus, GraduationCap, MapPin, Calendar, Clock, Users, DollarSign, Monitor, Building } from 'lucide-react';
import { toast } from 'sonner';

export default function ClassesPage() {
  const [classes, setClasses] = useState([
    { id: 1, title: 'Diction Class', type: 'online', price: 50, maxStudents: 20, currentStudents: 12, location: 'Zoom', date: '2025-02-05', time: '18:00', duration: '1 hour', frequency: 'weekly' },
    { id: 2, title: 'AutoCAD Basics', type: 'onsite', price: 75, maxStudents: 15, currentStudents: 8, location: 'Training Center', date: '2025-02-10', time: '14:00', duration: '2 hours', frequency: 'weekly' },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'online' | 'onsite'>('online');
  const [price, setPrice] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !price || !maxStudents || !date || !time || !duration) {
      toast.error('Please fill all required fields');
      return;
    }
    const newClass = {
      id: classes.length + 1,
      title,
      type,
      price: parseFloat(price),
      maxStudents: parseInt(maxStudents),
      currentStudents: 0,
      location: type === 'online' ? 'Zoom' : location,
      date,
      time,
      duration,
      frequency,
    };
    setClasses([newClass, ...classes]);
    setTitle('');
    setPrice('');
    setMaxStudents('');
    setLocation('');
    setDate('');
    setTime('');
    setDuration('');
    setFrequency('weekly');
    setDescription('');
    setIsDialogOpen(false);
    toast.success('Class created successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Classes</h1>
          <p className="text-muted-foreground mt-2">Create and manage your classes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>Set up a new class (online or onsite)</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Class Title</Label>
                <Input
                  placeholder="e.g., Diction Class"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={type === 'online' ? 'default' : 'outline'}
                    onClick={() => setType('online')}
                    className="flex-1"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Online
                  </Button>
                  <Button
                    variant={type === 'onsite' ? 'default' : 'outline'}
                    onClick={() => setType('onsite')}
                    className="flex-1"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Onsite
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Students</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 20"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(e.target.value)}
                  />
                </div>
              </div>
              {type === 'onsite' && (
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g., Training Center"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              )}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    placeholder="e.g., 1 hour"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={frequency === 'daily' ? 'default' : 'outline'}
                      onClick={() => setFrequency('daily')}
                      size="sm"
                    >
                      Daily
                    </Button>
                    <Button
                      variant={frequency === 'weekly' ? 'default' : 'outline'}
                      onClick={() => setFrequency('weekly')}
                      size="sm"
                    >
                      Weekly
                    </Button>
                    <Button
                      variant={frequency === 'monthly' ? 'default' : 'outline'}
                      onClick={() => setFrequency('monthly')}
                      size="sm"
                    >
                      Monthly
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your class..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Create Class
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <Card key={cls.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {cls.title}
                </CardTitle>
                <Badge variant={cls.type === 'online' ? 'default' : 'secondary'}>
                  {cls.type}
                </Badge>
              </div>
              <CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <DollarSign className="w-4 h-4" />
                  <span>${cls.price}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{cls.date} at {cls.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{cls.duration} ({cls.frequency})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{cls.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{cls.currentStudents}/{cls.maxStudents} students</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
