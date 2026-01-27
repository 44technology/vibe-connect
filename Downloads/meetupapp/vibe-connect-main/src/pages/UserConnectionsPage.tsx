import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, MessageCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import UserAvatar from '@/components/ui/UserAvatar';
import { useUser } from '@/hooks/useUsers';
import { useMatches } from '@/hooks/useMatches';
import { formatDistanceToNow } from 'date-fns';

const UserConnectionsPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { data: user } = useUser(userId);
  const { data: connections } = useMatches('ACCEPTED');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter connections - show connections where this user is involved
  // In dummy mode, we'll show all connections for simplicity
  const userConnections = connections || [];

  const filteredConnections = userConnections.filter(match =>
    match.user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {user?.displayName || user?.firstName}'s Connections
          </h1>
        </div>
        
        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          {filteredConnections.length} connections
        </p>
        
        {filteredConnections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No connections yet</p>
          </div>
        ) : (
          filteredConnections.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-elevated p-4 flex items-center gap-4"
            >
              <motion.button
                onClick={() => navigate(`/user/${match.user.id}`)}
                whileTap={{ scale: 0.95 }}
              >
                <UserAvatar 
                  src={match.user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'} 
                  alt={match.user.displayName || `${match.user.firstName} ${match.user.lastName}`} 
                  size="lg" 
                />
              </motion.button>
              
              <div className="flex-1 min-w-0">
                <motion.button
                  onClick={() => navigate(`/user/${match.user.id}`)}
                  className="text-left w-full"
                >
                  <h3 className="font-semibold text-foreground truncate">
                    {match.user.displayName || `${match.user.firstName} ${match.user.lastName}`}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Connected {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}
                  </p>
                </motion.button>
              </div>

              <motion.button
                className="p-2 rounded-full bg-primary/10 text-primary"
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(`/chat?userId=${match.user.id}`)}
              >
                <MessageCircle className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ))
        )}
      </div>

      <BottomNav />
    </MobileLayout>
  );
};

export default UserConnectionsPage;
