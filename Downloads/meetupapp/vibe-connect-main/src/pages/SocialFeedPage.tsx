import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Plus, Camera, Image, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import UserAvatar from '@/components/ui/UserAvatar';

const stories = [
  { id: '1', name: 'Your Story', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', hasStory: false, isUser: true },
  { id: '2', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', hasStory: true, isUser: false },
  { id: '3', name: 'Mike', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', hasStory: true, isUser: false },
  { id: '4', name: 'Emma', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', hasStory: true, isUser: false },
  { id: '5', name: 'David', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', hasStory: true, isUser: false },
  { id: '6', name: 'Lisa', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', hasStory: true, isUser: false },
];

const posts = [
  {
    id: '1',
    user: { name: 'Sarah Martinez', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    content: 'Amazing coffee vibe at Panther Coffee! Met some awesome people today ☕✨',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
    location: 'Panther Coffee, Wynwood',
    likes: 42,
    comments: 8,
    time: '2h ago',
    liked: false,
  },
  {
    id: '2',
    user: { name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    content: 'Tennis doubles was fire today! 🎾 Great game everyone!',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600',
    location: 'Flamingo Park Tennis',
    likes: 28,
    comments: 5,
    time: '4h ago',
    liked: true,
  },
  {
    id: '3',
    user: { name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
    content: 'Perfect Sunday brunch with new friends! This app is amazing 🥂',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
    location: 'Zuma Miami',
    likes: 67,
    comments: 12,
    time: '6h ago',
    liked: false,
  },
  {
    id: '4',
    user: { name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    content: 'Networking event was a success! Made 5 new connections today 💼',
    image: null,
    location: 'Downtown Miami',
    likes: 35,
    comments: 7,
    time: '8h ago',
    liked: false,
  },
];

const SocialFeedPage = () => {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-foreground">Social</h1>
          <motion.button
            onClick={() => setShowNewPost(true)}
            className="p-2 rounded-full bg-primary text-primary-foreground"
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Stories */}
      <div className="px-4 py-3">
        <div className="flex gap-4 overflow-x-auto hide-scrollbar">
          {stories.map((story) => (
            <motion.div
              key={story.id}
              className="flex flex-col items-center gap-1 flex-shrink-0"
              whileTap={{ scale: 0.95 }}
            >
              <div className={`p-0.5 rounded-full ${story.hasStory ? 'bg-gradient-to-br from-primary to-secondary' : story.isUser ? 'bg-muted' : ''}`}>
                <div className="p-0.5 bg-background rounded-full">
                  <div className="relative">
                    <UserAvatar src={story.avatar} alt={story.name} size="lg" />
                    {story.isUser && (
                      <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                        <Plus className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{story.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="pb-4 space-y-4">
        {posts.map((post) => {
          const isLiked = likedPosts[post.id] ?? post.liked;
          return (
            <div key={post.id} className="bg-card">
              {/* Post header */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <UserAvatar src={post.user.avatar} alt={post.user.name} size="md" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">{post.user.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{post.location}</span>
                      <span>• {post.time}</span>
                    </div>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.9 }}>
                  <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>

              {/* Post content */}
              <p className="px-4 text-foreground text-sm mb-2">{post.content}</p>

              {/* Post image */}
              {post.image && (
                <img src={post.image} alt="" className="w-full aspect-square object-cover" />
              )}

              {/* Post actions */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.button 
                    className="flex items-center gap-1"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleLike(post.id)}
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-loveme text-loveme' : 'text-foreground'}`} />
                    <span className="text-sm text-muted-foreground">{post.likes + (isLiked && !post.liked ? 1 : 0)}</span>
                  </motion.button>
                  <motion.button 
                    className="flex items-center gap-1"
                    whileTap={{ scale: 0.9 }}
                  >
                    <MessageCircle className="w-6 h-6 text-foreground" />
                    <span className="text-sm text-muted-foreground">{post.comments}</span>
                  </motion.button>
                </div>
                <motion.button whileTap={{ scale: 0.9 }}>
                  <Share2 className="w-5 h-5 text-foreground" />
                </motion.button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <motion.button
                onClick={() => setShowNewPost(false)}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6 text-foreground" />
              </motion.button>
              <h2 className="font-bold text-foreground">New Post</h2>
              <motion.button
                className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium"
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewPost(false)}
              >
                Share
              </motion.button>
            </div>
            
            <div className="p-4">
              <div className="flex gap-3">
                <UserAvatar 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" 
                  alt="You" 
                  size="md" 
                />
                <textarea
                  placeholder="What's happening at your vibe?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[120px]"
                />
              </div>
              
              <div className="flex gap-4 mt-4 pt-4 border-t border-border">
                <motion.button 
                  className="flex items-center gap-2 text-primary"
                  whileTap={{ scale: 0.95 }}
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-sm">Camera</span>
                </motion.button>
                <motion.button 
                  className="flex items-center gap-2 text-primary"
                  whileTap={{ scale: 0.95 }}
                >
                  <Image className="w-6 h-6" />
                  <span className="text-sm">Photo</span>
                </motion.button>
                <motion.button 
                  className="flex items-center gap-2 text-primary"
                  whileTap={{ scale: 0.95 }}
                >
                  <MapPin className="w-6 h-6" />
                  <span className="text-sm">Location</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </MobileLayout>
  );
};

export default SocialFeedPage;
