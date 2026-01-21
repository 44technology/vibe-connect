import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Image as ImageIcon, MapPin, Calendar, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePost } from '@/hooks/usePosts';
import { useMeetups } from '@/hooks/useMeetups';
import { useVenues } from '@/hooks/useVenues';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreatePostModal = ({ open, onOpenChange, onSuccess }: CreatePostModalProps) => {
  const { isAuthenticated } = useAuth();
  const createPost = useCreatePost();
  const [content, setContent] = useState('');
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
      toast.error('Please login to create a post');
      return;
    }

    if (!content.trim() && !selectedImage) {
      toast.error('Please add content or an image');
      return;
    }

    try {
      await createPost.mutateAsync({
        content: content.trim() || undefined,
        image: selectedImage || undefined,
        venueId: selectedVenue || undefined,
        meetupId: selectedMeetup || undefined,
      });
      
      toast.success('Post created successfully!');
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedVenue('');
      setSelectedMeetup('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create post');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        {/* Elegant Header */}
        <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-t-xl overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234834BC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-2 shadow-lg"
              >
                <ImageIcon className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <h2 className="text-xl font-bold text-foreground">Create Post</h2>
              <p className="text-sm text-muted-foreground">Share your moments</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Content Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-primary rounded-full"></span>
              What's on your mind?
            </label>
            <Textarea
              placeholder="Share your thoughts, experiences, or moments..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32 rounded-2xl resize-none border-2 border-border focus:border-primary/50 transition-colors bg-card"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {content.length > 0 && `${500 - content.length} characters left`}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {content.length}/500
              </p>
            </div>
          </div>

          {/* Image Preview/Upload */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-primary rounded-full"></span>
              Add Photo
            </label>
            {imagePreview ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <div className="relative overflow-hidden rounded-2xl border-2 border-border">
                  <img
                    src={imagePreview}
                    alt="Post preview"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <motion.button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-3 right-3 p-2.5 rounded-full bg-black/70 backdrop-blur-md hover:bg-black/90 transition-colors shadow-lg"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <X className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all group"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ImageIcon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Tap to add photo</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</p>
                </div>
              </motion.button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Optional: Link to Venue */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-primary rounded-full"></span>
              <MapPin className="w-4 h-4 text-primary" />
              Link to Venue (Optional)
            </label>
            <select
              value={selectedVenue}
              onChange={(e) => {
                setSelectedVenue(e.target.value);
                setSelectedMeetup(''); // Clear meetup if venue selected
              }}
              className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value="">Select a venue...</option>
              {venues?.slice(0, 10).map((venue: any) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>

          {/* Optional: Link to Meetup */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-primary rounded-full"></span>
              <Calendar className="w-4 h-4 text-primary" />
              Link to Vibe (Optional)
            </label>
            <select
              value={selectedMeetup}
              onChange={(e) => {
                setSelectedMeetup(e.target.value);
                setSelectedVenue(''); // Clear venue if meetup selected
              }}
              className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value="">Select a vibe...</option>
              {meetups?.slice(0, 10).map((meetup: any) => (
                <option key={meetup.id} value={meetup.id}>
                  {meetup.title}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={(!content.trim() && !selectedImage) || createPost.isPending}
              className="w-full h-14 rounded-2xl bg-gradient-primary text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              {createPost.isPending ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Posting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Share Post
                </span>
              )}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
