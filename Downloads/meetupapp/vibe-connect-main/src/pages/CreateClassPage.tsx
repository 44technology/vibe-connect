import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, BookOpen, Camera, Calendar, Clock, DollarSign, Users } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  const [loading, setLoading] = useState(false);

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
        venueId,
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
            <h2 className="text-2xl font-bold text-foreground mb-1">Create a Class</h2>
            <p className="text-muted-foreground">Offer classes at your venue</p>
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
                Schedule (optional)
              </label>
              <Input
                placeholder="e.g., Every Saturday 10am-12pm"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="h-12 rounded-xl"
              />
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
                  placeholder="e.g., 50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 glass safe-bottom p-4 border-t border-border">
          <Button
            onClick={handleSubmit}
            disabled={!title || !description || !skill || !venueId || !startTime || loading}
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
