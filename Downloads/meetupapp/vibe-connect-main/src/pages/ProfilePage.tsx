import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings, ChevronRight, MapPin, Star, Trophy, Users, Calendar, Heart, Share2, Edit, GraduationCap, X } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import UserAvatar from '@/components/ui/UserAvatar';
import CategoryChip from '@/components/ui/CategoryChip';
import { Coffee, Dumbbell, Heart as HeartIcon, Briefcase, Users as UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS, apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const interests = [
  { icon: Coffee, label: 'Coffee' },
  { icon: Dumbbell, label: 'Tennis' },
  { icon: HeartIcon, label: 'Yoga' },
  { icon: Briefcase, label: 'Networking' },
];

interface UserStats {
  connections: number;
  meetups: number;
  badges: number;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user stats
  const { data: statsData, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { connections: 0, meetups: 0, badges: 0 };
      const response = await apiRequest<{ success: boolean; data: UserStats }>(
        API_ENDPOINTS.USERS.STATS(user.id)
      );
      return response.data;
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
  });

  const stats = [
    { 
      label: 'Connections', 
      value: statsData?.connections ?? 0, 
      icon: Users, 
      route: '/connections' 
    },
    { 
      label: 'Vibes', 
      value: statsData?.meetups ?? 0, 
      icon: Calendar, 
      route: '/my-meetups' 
    },
    { 
      label: 'Badges', 
      value: statsData?.badges ?? 0, 
      icon: Trophy, 
      route: '/badges' 
    },
  ];

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setEditForm({
        displayName: user.displayName || '',
        bio: user.bio || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!editForm.firstName || !editForm.lastName) {
      toast.error('First name and last name are required');
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest(API_ENDPOINTS.USERS.UPDATE, {
        method: 'PUT',
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          displayName: editForm.displayName || `${editForm.firstName} ${editForm.lastName}`,
          bio: editForm.bio,
        }),
      });

      // Update local user state
      await updateUser({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        displayName: editForm.displayName || `${editForm.firstName} ${editForm.lastName}`,
        bio: editForm.bio,
      });

      toast.success('Profile updated successfully!');
      setShowEditModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="relative">
        {/* Cover gradient */}
        <div className="h-32 bg-gradient-primary" />
        
        {/* Settings button */}
        <motion.button 
          onClick={() => navigate('/settings')}
          className="absolute top-4 right-4 p-2 rounded-full bg-card/20 backdrop-blur-sm"
          whileTap={{ scale: 0.9 }}
        >
          <Settings className="w-5 h-5 text-primary-foreground" />
        </motion.button>

        {/* Profile info */}
        <div className="px-4 -mt-12">
          <div className="flex flex-col items-center">
            <div className="relative">
              <UserAvatar 
                src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300"} 
                alt={user?.displayName || `${user?.firstName} ${user?.lastName}` || 'User'} 
                size="xl"
              />
              <motion.button 
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-md"
                whileTap={{ scale: 0.9 }}
              >
                <Edit className="w-4 h-4" />
              </motion.button>
            </div>
            
            <h1 className="mt-3 text-xl font-bold text-foreground">
              {user?.displayName || `${user?.firstName} ${user?.lastName}` || 'User'}
            </h1>
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Miami, FL</span>
            </div>

            {/* Verification badge */}
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Star className="w-3 h-3 fill-primary" /> Verified
              </span>
            </div>
          </div>

          {/* Stats - Clickable */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.button
                  key={stat.label}
                  className="card-elevated p-4 text-center"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(stat.route)}
                >
                  <Icon className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-xl font-bold text-foreground">
                    {statsLoading ? '-' : stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.button>
              );
            })}
          </div>

          {/* Bio */}
          {user?.bio && (
            <div className="mt-6 card-elevated p-4">
              <h3 className="font-semibold text-foreground mb-2">About me</h3>
              <p className="text-muted-foreground text-sm">
                {user.bio}
              </p>
            </div>
          )}

          {/* Common Interests */}
          <div className="mt-4 card-elevated p-4">
            <h3 className="font-semibold text-foreground mb-3 text-lg">Common Interests</h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <CategoryChip
                  key={interest.label}
                  icon={interest.icon}
                  label={interest.label}
                />
              ))}
            </div>
          </div>

          {/* Looking for */}
          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-3">Looking for</h3>
            <div className="flex gap-2">
              <span className="chip chip-friendme">
                <Users className="w-4 h-4" /> Friendship
              </span>
              <span className="chip chip-connectme">
                <Briefcase className="w-4 h-4" /> Networking
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-xl">
              <Share2 className="w-4 h-4 mr-2" /> Share Profile
            </Button>
            <Button 
              onClick={() => setShowEditModal(true)}
              className="flex-1 h-12 rounded-xl bg-gradient-primary"
            >
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </div>

          {/* Quick links */}
          <div className="mt-6 space-y-2 pb-4">
            {[
              { label: 'My Vibes', icon: Calendar, route: '/my-meetups' },
              { label: 'My Classes', icon: GraduationCap, route: '/my-classes' },
              { label: 'Saved Venues', icon: Heart, route: '/discover' },
              { label: 'Social Feed', icon: Users, route: '/social' },
              { label: 'Settings', icon: Settings, route: '/settings' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  className="w-full p-4 rounded-xl bg-card flex items-center justify-between"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(item.route)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-4 bg-background rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
                <motion.button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-full hover:bg-muted"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-foreground" />
                </motion.button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    First Name
                  </label>
                  <Input
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    placeholder="First Name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Last Name
                  </label>
                  <Input
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    placeholder="Last Name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Display Name
                  </label>
                  <Input
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    placeholder="Display Name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-gradient-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </MobileLayout>
  );
};

export default ProfilePage;
