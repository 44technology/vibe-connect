import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, BookOpen, Camera } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateLearnRequest } from '@/hooks/useLearn';
import { toast } from 'sonner';

const CreateLearnPage = () => {
  const navigate = useNavigate();
  const createLearnRequest = useCreateLearnRequest();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skill, setSkill] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async () => {
    try {
      if (!title || !description || !skill) {
        toast.error('Please fill in all required fields');
        return;
      }

      await createLearnRequest.mutateAsync({
        title,
        description,
        skill,
        category: category || undefined,
        image: image || undefined,
      });

      toast.success('Learn request created successfully!');
      navigate('/learn');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create learn request');
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
            <h1 className="font-bold text-foreground">Create Learn Request</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">What do you want to learn?</h2>
            <p className="text-muted-foreground">Share your learning goals and find teachers or venues</p>
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
                  {image ? image.name : 'Add photo (optional)'}
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
                Title *
              </label>
              <Input
                placeholder="e.g., Learn Tennis Basics"
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
                placeholder="e.g., Tennis, Cooking, Yoga, Piano..."
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category (optional)
              </label>
              <Input
                placeholder="e.g., Sports, Arts, Music, Wellness..."
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
                placeholder="Tell us more about what you want to learn, your current level, and what you're looking for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl min-h-[120px]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 glass safe-bottom p-4 border-t border-border">
          <Button
            onClick={handleSubmit}
            disabled={!title || !description || !skill || createLearnRequest.isPending}
            className="w-full h-12 rounded-xl bg-gradient-primary"
          >
            {createLearnRequest.isPending ? 'Creating...' : 'Post Learn Request'}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default CreateLearnPage;
