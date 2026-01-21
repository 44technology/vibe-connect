import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Star, Users, Calendar, MapPin, Heart, Zap, Crown, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';

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

const BadgesPage = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            onClick={() => navigate('/profile')}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground">Badges</h1>
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
            <Target className="w-8 h-8 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold text-foreground">{availableBadges.length}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </div>
        </div>

        {/* Earned Badges */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Earned Badges</h2>
          <div className="grid grid-cols-3 gap-3">
            {earnedBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-elevated p-4 text-center"
                >
                  <div className={`w-12 h-12 rounded-full ${badge.color} mx-auto flex items-center justify-center mb-2`}>
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-2">{badge.name}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Available Badges */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">In Progress</h2>
          <div className="space-y-3">
            {availableBadges.map((badge, index) => {
              const Icon = badge.icon;
              const progressPercent = (badge.progress / badge.total) * 100;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-elevated p-4 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-full ${badge.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{badge.progress}/{badge.total}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>

      <BottomNav />
    </MobileLayout>
  );
};

export default BadgesPage;
