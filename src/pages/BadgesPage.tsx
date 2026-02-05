import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Lock } from "lucide-react";

const badges = [
  { id: 1, name: "Social Butterfly", emoji: "🦋", description: "Made 50+ connections", unlocked: true },
  { id: 2, name: "Vibe Master", emoji: "✨", description: "Hosted 10 vibes", unlocked: true },
  { id: 3, name: "Early Bird", emoji: "🌅", description: "Attended 5 morning events", unlocked: true },
  { id: 4, name: "Night Owl", emoji: "🦉", description: "Attended 5 evening events", unlocked: false, progress: 3 },
  { id: 5, name: "Adventurer", emoji: "🗺️", description: "Visited 20 venues", unlocked: false, progress: 12 },
  { id: 6, name: "Trendsetter", emoji: "🔥", description: "Started a viral vibe", unlocked: false, progress: 0 },
];

const BadgesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border p-4 flex items-center gap-4 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">My Badges</h1>
        <span className="ml-auto text-muted-foreground">
          {badges.filter((b) => b.unlocked).length}/{badges.length}
        </span>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        {badges.map((badge) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative bg-card rounded-2xl p-4 border border-border text-center ${
              !badge.unlocked && "opacity-60"
            }`}
          >
            {!badge.unlocked && (
              <div className="absolute top-2 right-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div className="text-4xl mb-2">{badge.emoji}</div>
            <h3 className="font-semibold text-sm">{badge.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
            {!badge.unlocked && badge.progress !== undefined && (
              <div className="mt-3">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(badge.progress / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{badge.progress}/5</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BadgesPage;
