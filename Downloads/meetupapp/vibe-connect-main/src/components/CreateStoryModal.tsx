import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Image as ImageIcon, MapPin, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCreateStory } from '@/hooks/useStories';
import { useMeetups } from '@/hooks/useMeetups';
import { useVenues } from '@/hooks/useVenues';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface CreateStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateStoryModal = ({ open, onOpenChange, onSuccess }: CreateStoryModalProps) => {
  const { isAuthenticated } = useAuth();
  const createStory = useCreateStory();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [selectedMeetup, setSelectedMeetup] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: venues } = useVenues({});
  const { data: meetups } = useMeetups({});

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to create a story');
      return;
    }

    if (!selectedImage) {
      toast.error('Please select an image');
      return;
    }

    try {
      await createStory.mutateAsync({
        image: selectedImage,
        venueId: selectedVenue || undefined,
        meetupId: selectedMeetup || undefined,
      });
      
      toast.success('Story created successfully!');
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedVenue('');
      setSelectedMeetup('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create story');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Image Preview/Upload */}
          <div>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Story preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <motion.button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur-sm"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-3 hover:border-primary transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <Camera className="w-12 h-12 text-muted-foreground" />
                <span className="text-muted-foreground">Tap to add photo</span>
              </motion.button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Optional: Link to Venue */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Link to Venue (Optional)
            </label>
            <select
              value={selectedVenue}
              onChange={(e) => {
                setSelectedVenue(e.target.value);
                setSelectedMeetup(''); // Clear meetup if venue selected
              }}
              className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">None</option>
              {venues?.slice(0, 10).map((venue: any) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>

          {/* Optional: Link to Meetup */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Link to Vibe (Optional)
            </label>
            <select
              value={selectedMeetup}
              onChange={(e) => {
                setSelectedMeetup(e.target.value);
                setSelectedVenue(''); // Clear venue if meetup selected
              }}
              className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">None</option>
              {meetups?.slice(0, 10).map((meetup: any) => (
                <option key={meetup.id} value={meetup.id}>
                  {meetup.title}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedImage || createStory.isPending}
            className="w-full h-12 rounded-xl bg-gradient-primary"
          >
            {createStory.isPending ? 'Creating...' : 'Create Story'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStoryModal;
