import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, BookOpen, Camera, Calendar, Clock, DollarSign, Users, MapPin, Plus, AlertCircle, Crown, Lock, Monitor, Video, Building } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useVenues } from '@/hooks/useVenues';
import { toast } from 'sonner';
import { apiRequest, API_ENDPOINTS, apiUpload } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const CreateClassPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: venues = [] } = useVenues();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skill, setSkill] = useState('');
  const [category, setCategory] = useState('');
  const [venueId, setVenueId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [price, setPrice] = useState('');
  const [schedule, setSchedule] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isExclusive, setIsExclusive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [frequency, setFrequency] = useState<'once' | 'weekly' | 'custom'>('once');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [lessons, setLessons] = useState<Array<{id: string; day: string; time: string; title: string}>>([]);
  const [showAds, setShowAds] = useState(true); // Default true for free classes
  const [type, setType] = useState<'online' | 'onsite' | 'hybrid'>('online');
  const [meetingPlatform, setMeetingPlatform] = useState<'zoom' | 'teams' | 'meet' | 'webex' | 'custom' | ''>('');
  const [meetingLink, setMeetingLink] = useState('');
  const [customPlatformName, setCustomPlatformName] = useState('');
  const [physicalLocation, setPhysicalLocation] = useState('');
  
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
  
  const handleAddLesson = () => {
    if (frequency !== 'custom' || selectedDays.length === 0) {
      toast.error('Please select custom days first');
      return;
    }
    if (!startTime) {
      toast.error('Please set start time first');
      return;
    }
    
    // Add a lesson for each selected day that doesn't have a lesson yet
    const daysWithoutLessons = selectedDays.filter(day => 
      !lessons.some(lesson => lesson.day === day)
    );
    
    if (daysWithoutLessons.length === 0) {
      toast.info('All selected days already have lessons');
      return;
    }
    
    const timeOnly = startTime.split('T')[1] || startTime.split(' ')[1] || '10:00';
    const newLessons = daysWithoutLessons.map(day => ({
      id: `lesson-${Date.now()}-${day}`,
      day,
      time: timeOnly,
      title: `${weekDays.find(w => w.value === day)?.label} - ${title || 'Lesson'}`,
    }));
    
    setLessons([...lessons, ...newLessons]);
    toast.success(`${newLessons.length} lesson(s) added`);
  };

  const handleRemoveLesson = (lessonId: string) => {
    setLessons(lessons.filter(l => l.id !== lessonId));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to create a class');
      navigate('/');
      return;
    }

    try {
      if (!title || !description || !skill || !venueId || !startTime) {
        toast.error('Please fill in all required fields');
        return;
      }

      setLoading(true);

      const classData = {
        title,
        description,
        skill,
        category: category || undefined,
        venueId: type === 'onsite' ? venueId : undefined,
        type,
        meetingPlatform: (type === 'online' || type === 'hybrid') ? meetingPlatform : undefined,
        meetingLink: (type === 'online' || type === 'hybrid') ? meetingLink : undefined,
        customPlatformName: (type === 'online' || type === 'hybrid') && meetingPlatform === 'custom' ? customPlatformName : undefined,
        physicalLocation: type === 'hybrid' ? physicalLocation : undefined,
        startTime: new Date(`${startTime}`).toISOString(),
        endTime: endTime ? new Date(`${endTime}`).toISOString() : undefined,
        maxStudents: maxStudents ? parseInt(maxStudents) : undefined,
        price: price ? parseFloat(price) : undefined,
        schedule: schedule || undefined,
      };

      if (image) {
        await apiUpload(API_ENDPOINTS.CLASSES.CREATE, image, classData);
      } else {
        await apiRequest(API_ENDPOINTS.CLASSES.CREATE, {
          method: 'POST',
          body: JSON.stringify(classData),
        });
      }

      toast.success('Class created successfully!');
      navigate('/discover');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <MobileLayout hideNav>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 glass safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2"
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-foreground" />
            </motion.button>
            <h1 className="font-bold text-foreground">Create Class</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Create an Expert-Led Class</h2>
            <p className="text-muted-foreground">Share real experience, not theory. Teach what you've actually built and achieved. Entrepreneurs learn from real results.</p>
          </div>

          {/* Image upload */}
          <div>
            <label className="block">
              <motion.div 
                className="w-full h-32 rounded-2xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-2 cursor-pointer"
                whileTap={{ scale: 0.98 }}
              >
                <Camera className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {image ? image.name : 'Add class photo (optional)'}
                </span>
              </motion.div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Class Title *
              </label>
              <Input
                placeholder="e.g., Beginner Tennis Class"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Skill/Subject *
              </label>
              <Input
                placeholder="e.g., Tennis, Yoga, Cooking..."
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Class Type *
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <Button
                  type="button"
                  variant={type === 'online' ? 'default' : 'outline'}
                  onClick={() => {
                    setType('online');
                    setPhysicalLocation('');
                  }}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="text-xs">Online</span>
                </Button>
                <Button
                  type="button"
                  variant={type === 'hybrid' ? 'default' : 'outline'}
                  onClick={() => {
                    setType('hybrid');
                  }}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Video className="w-4 h-4" />
                  <span className="text-xs">Hybrid</span>
                </Button>
                <Button
                  type="button"
                  variant={type === 'onsite' ? 'default' : 'outline'}
                  onClick={() => {
                    setType('onsite');
                    setMeetingPlatform('');
                    setMeetingLink('');
                    setCustomPlatformName('');
                  }}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Building className="w-4 h-4" />
                  <span className="text-xs">Onsite</span>
                </Button>
              </div>
            </div>

            {(type === 'online' || type === 'hybrid') && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Meeting Platform *
                  </label>
                  <select
                    value={meetingPlatform}
                    onChange={(e) => {
                      setMeetingPlatform(e.target.value as 'zoom' | 'teams' | 'meet' | 'webex' | 'custom');
                      if (e.target.value !== 'custom') {
                        setCustomPlatformName('');
                      }
                    }}
                    className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground"
                  >
                    <option value="">Select platform...</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="meet">Google Meet</option>
                    <option value="webex">Webex</option>
                    <option value="custom">Other Platform</option>
                  </select>
                </div>
                {meetingPlatform === 'custom' && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Platform Name *
                    </label>
                    <Input
                      placeholder="e.g., Discord, Skype, etc."
                      value={customPlatformName}
                      onChange={(e) => setCustomPlatformName(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Meeting Link *
                  </label>
                  <Input
                    placeholder={meetingPlatform === 'custom' ? "e.g., https://discord.gg/..." : "e.g., https://zoom.us/j/123456789"}
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </>
            )}

            {type === 'hybrid' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Physical Location *
                </label>
                <Input
                  placeholder="e.g., Training Center, Room 101, 123 Main St, Mexico City"
                  value={physicalLocation}
                  onChange={(e) => setPhysicalLocation(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            )}

            {type === 'onsite' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Venue *
                </label>
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground"
                >
                  <option value="">Select a venue...</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} - {venue.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category (optional)
              </label>
              <Input
                placeholder="e.g., Sports, Arts, Wellness..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description *
              </label>
              <Textarea
                placeholder="Describe your class, what students will learn, skill level required..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Start Date/Time *
                </label>
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1">
                  <Clock className="w-4 h-4" /> End Time
                </label>
                <Input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Frequency
              </label>
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  variant={frequency === 'once' ? 'default' : 'outline'}
                  onClick={() => {
                    setFrequency('once');
                    setSelectedDays([]);
                    setLessons([]);
                  }}
                  className="flex-1"
                >
                  Once
                </Button>
                <Button
                  type="button"
                  variant={frequency === 'weekly' ? 'default' : 'outline'}
                  onClick={() => {
                    setFrequency('weekly');
                    setSelectedDays([]);
                    setLessons([]);
                  }}
                  className="flex-1"
                >
                  Weekly
                </Button>
                <Button
                  type="button"
                  variant={frequency === 'custom' ? 'default' : 'outline'}
                  onClick={() => setFrequency('custom')}
                  className="flex-1"
                >
                  Custom Days
                </Button>
              </div>
              {frequency === 'custom' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-muted/50">
                    {weekDays.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`day-${day.value}`}
                          checked={selectedDays.includes(day.value)}
                          onChange={() => toggleDay(day.value)}
                          className="w-4 h-4 rounded border-border"
                        />
                        <label
                          htmlFor={`day-${day.value}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedDays.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Lessons ({lessons.length})</label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleAddLesson}
                          disabled={!startTime}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Lessons
                        </Button>
                      </div>
                      {lessons.length === 0 ? (
                        <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30 text-center">
                          <AlertCircle className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground mb-1">No lessons added yet</p>
                          <p className="text-xs text-muted-foreground">Click "Add Lessons" to create lessons for selected days</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {lessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{weekDays.find(w => w.value === lesson.day)?.label}</p>
                                <p className="text-xs text-muted-foreground">{lesson.time}</p>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveLesson(lesson.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1">
                  <Users className="w-4 h-4" /> Max Students
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 20"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> Price
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 50 (0 for free)"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    // If price is set, disable ads
                    if (parseFloat(e.target.value) > 0) {
                      setShowAds(false);
                    } else {
                      setShowAds(true);
                    }
                  }}
                  className="h-12 rounded-xl"
                />
                {price && parseFloat(price) > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">+4% processing fee applies</p>
                )}
              </div>
            </div>
            
            {/* Ads Settings - Only for Free Classes */}
            {(!price || parseFloat(price) === 0) && (
              <div className="space-y-3 p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      Show Ads
                    </Label>
                    <p className="text-xs text-muted-foreground">Free classes can show ads (can be disabled)</p>
                  </div>
                  <Switch checked={showAds} onCheckedChange={setShowAds} />
                </div>
                {showAds && (
                  <div className="p-2 rounded bg-orange-500/10 border border-orange-500/20">
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Ads will be displayed in this free class. Users can close ads.
                    </p>
                  </div>
                )}
              </div>
            )}
            {price && parseFloat(price) > 0 && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                    Paid classes never show ads
                  </p>
                </div>
              </div>
            )}

            {/* Premium & Exclusive Options */}
            <div className="space-y-3 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <div>
                    <label className="text-sm font-medium text-foreground">Premium Class</label>
                    <p className="text-xs text-muted-foreground">Highlight your expertise</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPremium(!isPremium)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isPremium ? 'bg-yellow-500' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                      isPremium ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  <div>
                    <label className="text-sm font-medium text-foreground">Exclusive Class</label>
                    <p className="text-xs text-muted-foreground">Limited seats, private access</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExclusive(!isExclusive)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isExclusive ? 'bg-purple-500' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                      isExclusive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 glass safe-bottom p-4 border-t border-border">
          <Button
            onClick={handleSubmit}
            disabled={!title || !description || !skill || !startTime || loading || (type === 'onsite' && !venueId) || ((type === 'online' || type === 'hybrid') && (!meetingPlatform || !meetingLink)) || (type === 'hybrid' && !physicalLocation.trim()) || (meetingPlatform === 'custom' && !customPlatformName.trim())}
            className="w-full h-12 rounded-xl bg-gradient-primary"
          >
            {loading ? 'Creating...' : 'Create Class'}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default CreateClassPage;
