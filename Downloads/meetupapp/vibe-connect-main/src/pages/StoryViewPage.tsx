import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import UserAvatar from '@/components/ui/UserAvatar';
import { useStories, useViewStory } from '@/hooks/useStories';
import { useAuth } from '@/contexts/AuthContext';

// Mock stories (same as HomePage)
const mockStories = [
  {
    id: 'mock-1',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    user: {
      id: 'user-1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      displayName: 'Sarah',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-2',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800',
    user: {
      id: 'user-2',
      firstName: 'Mike',
      lastName: 'Chen',
      displayName: 'Mike',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-3',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    user: {
      id: 'user-3',
      firstName: 'Emma',
      lastName: 'Williams',
      displayName: 'Emma',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    },
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-4',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
    user: {
      id: 'user-4',
      firstName: 'David',
      lastName: 'Brown',
      displayName: 'David',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

const StoryViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: stories } = useStories();
  const viewStory = useViewStory();

  const [progress, setProgress] = useState(0);

  // Combine API stories with mock stories
  const allStoriesList = [...(stories || []), ...mockStories];
  const currentStoryIndexInList = allStoriesList.findIndex((s: any) => s.id === id);
  const currentStory = currentStoryIndexInList >= 0 ? allStoriesList[currentStoryIndexInList] : null;

  // Mark story as viewed
  useEffect(() => {
    if (currentStory && user && id) {
      viewStory.mutate(id);
    }
  }, [id, currentStory, user]);

  // Auto-progress story (5 seconds)
  useEffect(() => {
    if (!currentStory) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2; // Update every 100ms, 5 seconds total
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStory]);

  const handleNext = () => {
    if (currentStoryIndexInList < allStoriesList.length - 1) {
      const nextStory = allStoriesList[currentStoryIndexInList + 1];
      navigate(`/story/${nextStory.id}`);
      setProgress(0);
    } else {
      navigate('/home');
    }
  };

  const handlePrev = () => {
    if (currentStoryIndexInList > 0) {
      const prevStory = allStoriesList[currentStoryIndexInList - 1];
      navigate(`/story/${prevStory.id}`);
      setProgress(0);
    } else {
      navigate('/home');
    }
  };

  if (!currentStory) {
    return (
      <MobileLayout hideNav>
        <div className="flex items-center justify-center h-screen">
          <p className="text-white">Story not found</p>
        </div>
      </MobileLayout>
    );
  }

  const userName = currentStory.user?.displayName || 
    `${currentStory.user?.firstName || ''} ${currentStory.user?.lastName || ''}`.trim() || 
    'User';

  return (
    <MobileLayout hideNav>
      <div className="relative h-screen w-full bg-black overflow-hidden">
        {/* Story Image */}
        <div className="relative h-full w-full">
          <img
            src={currentStory.image}
            alt="Story"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-50">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar
                src={currentStory.user?.avatar}
                alt={userName}
                size="sm"
              />
              <div>
                <p className="text-white font-semibold text-sm">{userName}</p>
                <p className="text-white/70 text-xs">
                  {new Date(currentStory.createdAt).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => navigate('/home')}
              className="p-2 rounded-full bg-black/30 backdrop-blur-sm"
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Navigation Areas */}
        <div className="absolute inset-0 flex">
          {/* Left side - Previous */}
          <div
            className="flex-1 cursor-pointer"
            onClick={handlePrev}
          />
          {/* Right side - Next */}
          <div
            className="flex-1 cursor-pointer"
            onClick={handleNext}
          />
        </div>

        {/* Navigation Buttons (for desktop) */}
        {currentStoryIndexInList > 0 && (
          <motion.button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 backdrop-blur-sm z-30"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </motion.button>
        )}
        {currentStoryIndexInList < allStoriesList.length - 1 && (
          <motion.button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 backdrop-blur-sm z-30"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </div>
    </MobileLayout>
  );
};

export default StoryViewPage;
