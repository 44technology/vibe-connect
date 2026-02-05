import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, MessageCircle, Share2, Plus, Camera } from "lucide-react";

const mockStories = [
  { id: 1, user: "You", avatar: "👤", isOwn: true },
  { id: 2, user: "Sarah", avatar: "👩", hasNew: true },
  { id: 3, user: "Mike", avatar: "👨", hasNew: true },
  { id: 4, user: "Emma", avatar: "👩‍🦰", hasNew: false },
];

const mockPosts = [
  {
    id: 1,
    user: "Sarah Miller",
    avatar: "👩",
    venue: "Blue Bottle Coffee",
    time: "2h ago",
    content: "Amazing coffee vibes today! ☕✨",
    image: "🖼️",
    likes: 42,
    comments: 8,
  },
  {
    id: 2,
    user: "Mike Chen",
    avatar: "👨",
    venue: "Central Park",
    time: "4h ago",
    content: "Morning yoga session was incredible! 🧘‍♂️",
    image: "🌅",
    likes: 89,
    comments: 15,
  },
];

const SocialFeedPage = () => {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const toggleLike = (postId: number) => {
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Social Feed</h1>
        </div>
        <button className="p-2 bg-primary text-primary-foreground rounded-full">
          <Camera className="w-5 h-5" />
        </button>
      </div>

      {/* Stories */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {mockStories.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-1">
              <div
                className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                  story.hasNew || story.isOwn
                    ? "ring-2 ring-primary ring-offset-2"
                    : "ring-2 ring-muted ring-offset-2"
                } bg-muted`}
              >
                {story.avatar}
                {story.isOwn && (
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </div>
                )}
              </div>
              <span className="text-xs">{story.user}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="p-4 space-y-6">
        {mockPosts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            {/* Post Header */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-xl">
                {post.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{post.user}</h3>
                <p className="text-xs text-muted-foreground">
                  📍 {post.venue} • {post.time}
                </p>
              </div>
            </div>

            {/* Post Image */}
            <div className="aspect-square bg-muted flex items-center justify-center text-8xl">
              {post.image}
            </div>

            {/* Post Actions */}
            <div className="p-4">
              <div className="flex items-center gap-4 mb-3">
                <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1">
                  <Heart
                    className={`w-6 h-6 ${
                      likedPosts.includes(post.id) ? "fill-loveme text-loveme" : ""
                    }`}
                  />
                </button>
                <button className="flex items-center gap-1">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="flex items-center gap-1">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
              <p className="font-semibold text-sm">
                {likedPosts.includes(post.id) ? post.likes + 1 : post.likes} likes
              </p>
              <p className="text-sm mt-1">
                <span className="font-semibold">{post.user.split(" ")[0]}</span> {post.content}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                View all {post.comments} comments
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SocialFeedPage;
