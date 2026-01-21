import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, Share2, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import UserAvatar from '@/components/ui/UserAvatar';

const venuePosts = [
  {
    id: '1',
    venue: {
      name: 'Panther Coffee',
      avatar: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150',
      location: 'Wynwood, Miami',
      rating: 4.8,
    },
    content: 'New Colombian coffee beans just arrived! Come try our special blend ☕',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
    likes: 89,
    comments: 12,
    time: '2h ago',
  },
  {
    id: '2',
    venue: {
      name: 'Zuma Miami',
      avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150',
      location: 'Downtown Miami',
      rating: 4.7,
    },
    content: 'Join us for our special sushi night every Friday! 🍣',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600',
    likes: 156,
    comments: 34,
    time: '5h ago',
  },
  {
    id: '3',
    venue: {
      name: 'La Bodeguita',
      avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150',
      location: 'Little Havana',
      rating: 4.6,
    },
    content: 'Salsa night every Thursday! Live music and dancing 💃',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
    likes: 203,
    comments: 45,
    time: '8h ago',
  },
  {
    id: '4',
    venue: {
      name: 'Equinox South Beach',
      avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150',
      location: 'South Beach',
      rating: 4.9,
    },
    content: 'New yoga classes starting next week! Sign up now 🧘',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600',
    likes: 67,
    comments: 8,
    time: '12h ago',
  },
];

const VenuePostsPage = () => {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground">Venue Posts</h1>
        </div>
      </div>

      {/* Posts */}
      <div className="px-4 py-4 space-y-4">
        {venuePosts.map((post) => (
          <motion.div
            key={post.id}
            className="card-elevated overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Venue Header */}
            <div className="p-4 flex items-center gap-3 border-b border-border">
              <UserAvatar src={post.venue.avatar} alt={post.venue.name} size="md" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{post.venue.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-secondary text-secondary" />
                    <span className="text-xs text-muted-foreground">{post.venue.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{post.venue.location}</span>
                </div>
              </div>
              <motion.button
                onClick={() => navigate(`/venue/${post.id}`)}
                className="text-primary text-sm font-medium"
                whileTap={{ scale: 0.95 }}
              >
                View
              </motion.button>
            </div>

            {/* Post Content */}
            <div className="p-4 space-y-3">
              <p className="text-foreground">{post.content}</p>
              
              {post.image && (
                <div className="rounded-xl overflow-hidden">
                  <img src={post.image} alt={post.content} className="w-full h-auto" />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={() => toggleLike(post.id)}
                    className="flex items-center gap-2"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        likedPosts[post.id] ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                      }`}
                    />
                    <span className="text-sm text-muted-foreground">{post.likes}</span>
                  </motion.button>
                  <motion.button
                    className="flex items-center gap-2"
                    whileTap={{ scale: 0.9 }}
                  >
                    <MessageCircle className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{post.comments}</span>
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }}>
                    <Share2 className="w-5 h-5 text-muted-foreground" />
                  </motion.button>
                </div>
                <span className="text-xs text-muted-foreground">{post.time}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </MobileLayout>
  );
};

export default VenuePostsPage;
