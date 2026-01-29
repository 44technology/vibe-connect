import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Plus, GraduationCap, MapPin, Calendar, Clock, Users, DollarSign, Monitor, Building, Video, Crown, Lock, TrendingUp } from 'lucide-react';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';

const classCategories = [
  { id: 'ecommerce', label: 'E-commerce & Digital', emoji: '🛒' },
  { id: 'realestate', label: 'Real Estate & Investing', emoji: '🏠' },
  { id: 'marketing', label: 'Marketing & Growth', emoji: '📈' },
  { id: 'mentality', label: 'Mentality & Lifestyle', emoji: '🧠' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'diction', label: 'Diction & Speech', emoji: '🎤' },
  { id: 'acting', label: 'Acting & Audition', emoji: '🎭' },
];

const mexicoCities = [
  { id: 'mexico-city', label: 'Mexico City' },
  { id: 'monterrey', label: 'Monterrey' },
  { id: 'guadalajara', label: 'Guadalajara' },
  { id: 'queretaro', label: 'Querétaro' },
  { id: 'cancun', label: 'Cancún / Playa del Carmen' },
];

export default function ClassesPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([
    { id: 1, title: 'Diction Class', category: 'diction', type: 'online', price: 50, maxStudents: 20, currentStudents: 12, location: 'Zoom', meetingPlatform: 'zoom', meetingLink: 'https://zoom.us/j/123456789', date: '2025-02-05', time: '18:00', duration: '1 hour', frequency: 'Monday, Wednesday, Friday', isPremium: false, isExclusive: false, isPopular: false, recentEnrollments: 0, city: 'mexico-city' },
    { id: 2, title: 'AutoCAD Basics', category: 'tech', type: 'onsite', price: 75, maxStudents: 15, currentStudents: 8, location: 'Training Center', date: '2025-02-10', time: '14:00', duration: '2 hours', frequency: 'weekly', isPremium: true, isExclusive: false, isPopular: true, recentEnrollments: 15, city: 'monterrey' },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<'online' | 'onsite' | 'hybrid'>('online');
  const [classType, setClassType] = useState<'regular' | 'masterclass'>('regular');
  const [price, setPrice] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [location, setLocation] = useState('');
  const [meetingPlatform, setMeetingPlatform] = useState<'zoom' | 'teams' | 'meet' | 'webex' | ''>('');
  const [meetingLink, setMeetingLink] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('weekly');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [isExclusive, setIsExclusive] = useState(false);
  
  const weekDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];
  
  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = () => {
    if (!title.trim() || !price || !maxStudents || !date || !time || !duration) {
      toast.error('Please fill all required fields');
      return;
    }
    if (frequency === 'custom' && selectedDays.length === 0) {
      toast.error('Please select at least one day for custom frequency');
      return;
    }
    const frequencyDisplay = frequency === 'custom' && selectedDays.length > 0
      ? selectedDays.map(d => weekDays.find(w => w.value === d)?.label).join(', ')
      : frequency;
    
    const newClass = {
      id: classes.length + 1,
      title,
      category: category || 'business',
      city: city || 'mexico-city',
      type,
      classType,
      price: parseFloat(price),
      maxStudents: parseInt(maxStudents),
      currentStudents: 0,
      location: (type === 'online' || type === 'hybrid') ? (meetingPlatform ? meetingPlatform.charAt(0).toUpperCase() + meetingPlatform.slice(1) : '') : location,
      meetingPlatform: (type === 'online' || type === 'hybrid') ? meetingPlatform : undefined,
      meetingLink: (type === 'online' || type === 'hybrid') ? meetingLink : undefined,
      date,
      time,
      duration,
      frequency: frequencyDisplay,
      selectedDays: frequency === 'custom' ? selectedDays : [],
      description,
      isPremium: classType === 'masterclass' ? true : isPremium,
      isExclusive: classType === 'masterclass' ? true : isExclusive,
      isPopular: false,
      recentEnrollments: 0,
    };
    setClasses([newClass, ...classes]);
    setTitle('');
    setPrice('');
    setMaxStudents('');
    setLocation('');
    setMeetingPlatform('');
    setMeetingLink('');
    setDate('');
    setTime('');
    setDuration('');
    setFrequency('weekly');
    setSelectedDays([]);
    setDescription('');
    setCategory('');
    setCity('');
    setClassType('regular');
    setIsPremium(false);
    setIsExclusive(false);
    setIsDialogOpen(false);
    toast.success(`${classType === 'masterclass' ? 'Masterclass' : 'Class'} created successfully!`);
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {classCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.emoji} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>City (Mexico)</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {mexicoCities.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Class Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={type === 'online' ? 'default' : 'outline'}
                    onClick={() => {
                      setType('online');
                      setLocation('');
                    }}
                    className="flex-1"
                    type="button"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Online
                  </Button>
                  <Button
                    variant={type === 'hybrid' ? 'default' : 'outline'}
                    onClick={() => {
                      setType('hybrid');
                      setLocation('');
                    }}
                    className="flex-1"
                    type="button"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Hybrid
                  </Button>
                  <Button
                    variant={type === 'onsite' ? 'default' : 'outline'}
                    onClick={() => {
                      setType('onsite');
                      setMeetingPlatform('');
                      setMeetingLink('');
                    }}
                    className="flex-1"
                    type="button"
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
              {(type === 'online' || type === 'hybrid') && (
                <>
                  <div className="space-y-2">
                    <Label>Meeting Platform</Label>
                    <Select value={meetingPlatform} onValueChange={(value) => setMeetingPlatform(value as 'zoom' | 'teams' | 'meet' | 'webex')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="teams">Microsoft Teams</SelectItem>
                        <SelectItem value="meet">Google Meet</SelectItem>
                        <SelectItem value="webex">Webex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Meeting Link</Label>
                    <Input
                      placeholder="e.g., https://zoom.us/j/123456789"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                    />
                  </div>
                </>
              )}
              {type === 'hybrid' && (
                <div className="space-y-2">
                  <Label>Physical Location</Label>
                  <Input
                    placeholder="e.g., Training Center, Room 101"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              )}
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
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant={frequency === 'daily' ? 'default' : 'outline'}
                        onClick={() => {
                          setFrequency('daily');
                          setSelectedDays([]);
                        }}
                        size="sm"
                        type="button"
                      >
                        Daily
                      </Button>
                      <Button
                        variant={frequency === 'weekly' ? 'default' : 'outline'}
                        onClick={() => {
                          setFrequency('weekly');
                          setSelectedDays([]);
                        }}
                        size="sm"
                        type="button"
                      >
                        Weekly
                      </Button>
                      <Button
                        variant={frequency === 'monthly' ? 'default' : 'outline'}
                        onClick={() => {
                          setFrequency('monthly');
                          setSelectedDays([]);
                        }}
                        size="sm"
                        type="button"
                      >
                        Monthly
                      </Button>
                      <Button
                        variant={frequency === 'custom' ? 'default' : 'outline'}
                        onClick={() => setFrequency('custom')}
                        size="sm"
                        type="button"
                      >
                        Custom Days
                      </Button>
                    </div>
                    {frequency === 'custom' && (
                      <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-muted/50">
                        {weekDays.map((day) => (
                          <div key={day.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`day-${day.value}`}
                              checked={selectedDays.includes(day.value)}
                              onCheckedChange={() => toggleDay(day.value)}
                            />
                            <label
                              htmlFor={`day-${day.value}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {day.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    {frequency === 'custom' && selectedDays.length === 0 && (
                      <p className="text-xs text-muted-foreground">Please select at least one day</p>
                    )}
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
          <Card 
            key={cls.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/classes/${cls.id}`)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {cls.title}
                  {(cls as any).classType === 'masterclass' && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600 ml-2">
                      <Crown className="w-3 h-3 mr-1" />
                      Masterclass
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {(cls as any).isPremium && (cls as any).classType !== 'masterclass' && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  {(cls as any).isExclusive && (cls as any).classType !== 'masterclass' && (
                    <Badge variant="outline" className="border-primary text-primary">
                      <Lock className="w-3 h-3 mr-1" />
                      Exclusive
                    </Badge>
                  )}
                  <Badge variant={cls.type === 'online' ? 'default' : 'secondary'}>
                    {cls.type}
                  </Badge>
                </div>
              </div>
              <CardDescription className="flex items-center gap-2 mt-2">
                <DollarSign className="w-4 h-4" />
                <span>${cls.price}</span>
                {parseFloat(price) > 0 && (
                  <span className="text-xs text-muted-foreground">(+3% platform fee)</span>
                )}
              </CardDescription>
              {(cls as any).isPopular && (cls as any).recentEnrollments > 0 && (
                <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-orange-600">This course is popular.</p>
                    <p className="text-xs text-muted-foreground">{(cls as any).recentEnrollments} people enrolled last week.</p>
                  </div>
                </div>
              )}
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
                  <span>
                    {cls.type === 'online' || cls.type === 'hybrid' 
                      ? (cls.meetingPlatform ? `${cls.meetingPlatform.charAt(0).toUpperCase() + cls.meetingPlatform.slice(1)}` : 'Online')
                      : cls.location}
                  </span>
                </div>
                {(cls.type === 'online' || cls.type === 'hybrid') && cls.meetingLink && (
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Join Meeting
                    </a>
                  </div>
                )}
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
