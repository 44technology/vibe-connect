import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Star, Users, Calendar, MapPin, Heart, Zap, Crown, Target } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import { useUser } from '@/hooks/useUsers';

// Dummy badges data
const earnedBadges = [
  { id: '1', icon: Star, name: 'First Vibe', description: 'Attended your first meetup', color: 'bg-secondary', earnedDate: 'Jan 10, 2024' },
  { id: '2', icon: Users, name: 'Social Butterfly', description: 'Connected with 10+ people', color: 'bg-friendme', earnedDate: 'Jan 15, 2024' },
  { id: '3', icon: Heart, name: 'Verified Member', description: 'Completed profile verification', color: 'bg-loveme', earnedDate: 'Jan 5, 2024' },
];

const availableBadges = [
  { id: '4', icon: Trophy, name: 'Vibe Master', description: 'Host 10 successful vibes', color: 'bg-muted', progress: 3, total: 10 },
  { id: '5', icon: Crown, name: 'Community Leader', description: 'Get 50 connections', color: 'bg-muted', progress: 24, total: 50 },
  { id: '6', icon: Calendar, name: 'Regular', description: 'Attend vibes 4 weeks in a row', color: 'bg-muted', progress: 2, total: 4 },
  { id: '7', icon: MapPin, name: 'Explorer', description: 'Visit 20 different venues', color: 'bg-muted', progress: 8, total: 20 },
  { id: '8', icon: Zap, name: 'Quick Connect', description: 'Make 5 connections in one vibe', color: 'bg-muted', progress: 3, total: 5 },
  { id: '9', icon: Target, name: 'Perfect Host', description: 'Get 5-star rating as host', color: 'bg-muted', progress: 0, total: 1 },
];

const UserBadgesPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { data: user } = useUser(userId);

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            onClick={() => navigate(`/user/${userId}`)}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground">
            {user?.displayName || user?.firstName}'s Badges
          </h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Stats */}
        <div className="card-elevated p-4 flex items-center justify-center gap-8">
          <div className="text-center">
            <Trophy className="w-8 h-8 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-foreground">{earnedBadges.length}</p>
            <p className="text-sm text-muted-foreground">Earned</p>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-center">
            <Star className="w-8 h-8 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold text-foreground">{availableBadges.length}</p>
            <p className="text-sm text-muted-foreground">Available</p>
          </div>
        </div>

        {/* Earned Badges */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Earned Badges</h2>
          <div className="grid grid-cols-2 gap-4">
            {earnedBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`card-elevated p-4 rounded-2xl ${badge.color} text-center`}
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-background/50 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                  <p className="text-xs text-muted-foreground">{badge.earnedDate}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Available Badges */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Available Badges</h2>
          <div className="space-y-3">
            {availableBadges.map((badge, index) => {
              const Icon = badge.icon;
              const progressPercent = (badge.progress / badge.total) * 100;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`card-elevated p-4 rounded-2xl ${badge.color}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">{badge.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-background/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {badge.progress}/{badge.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </MobileLayout>
  );
};

export default UserBadgesPage;
