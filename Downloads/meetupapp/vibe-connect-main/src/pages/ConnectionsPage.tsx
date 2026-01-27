import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, MessageCircle, UserMinus, UserPlus, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import UserAvatar from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/button';
import { useMatches, useUpdateMatch } from '@/hooks/useMatches';
import { useCreateDirectChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const ConnectionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'connections' | 'pending' | 'requests'>('connections');

  // Fetch accepted matches (connections)
  const { data: acceptedMatches, isLoading: connectionsLoading } = useMatches('ACCEPTED');
  // Fetch pending matches (sent requests)
  const { data: pendingMatches, isLoading: pendingLoading } = useMatches('PENDING');
  // Fetch all matches to find received requests
  const { data: allMatches } = useMatches();
  
  const updateMatch = useUpdateMatch();
  const createDirectChat = useCreateDirectChat();

  // Filter received requests (where user is receiver and status is PENDING)
  const receivedRequests = allMatches?.filter(m => !m.isSender && m.status === 'PENDING') || [];

  // Filter connections based on search
  const filteredConnections = acceptedMatches?.filter(match =>
    match.user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredPending = pendingMatches?.filter(match =>
    match.isSender && (match.user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const filteredRequests = receivedRequests.filter(match =>
    match.user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAcceptRequest = async (matchId: string) => {
    try {
      await updateMatch.mutateAsync({ matchId, status: 'ACCEPTED' });
      toast.success('Connection request accepted!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (matchId: string) => {
    try {
      await updateMatch.mutateAsync({ matchId, status: 'REJECTED' });
      toast.success('Connection request rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject request');
    }
  };

  const handleMessage = async (userId: string) => {
    try {
      const chat = await createDirectChat.mutateAsync(userId);
      navigate(`/chat?chatId=${chat.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start chat');
    }
  };

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
          <h1 className="text-xl font-bold text-foreground">Connections</h1>
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

      {/* Tabs */}
      <div className="px-4 pb-3">
        <div className="flex bg-muted rounded-xl p-1">
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'connections' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            Connections
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'pending' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all relative ${
              activeTab === 'requests' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            Requests
            {receivedRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {receivedRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {activeTab === 'connections' && (
          <>
            <p className="text-sm text-muted-foreground">
              {connectionsLoading ? 'Loading...' : `${filteredConnections.length} connections`}
            </p>
            
            {connectionsLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading connections...</p>
              </div>
            ) : filteredConnections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No connections yet</p>
              </div>
            ) : (
              filteredConnections.map((match, index) => {
                const userPhotos = match.user.photos || [];
                const previewPhotos = userPhotos.slice(0, 4); // Show first 4 photos/videos
                
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card-elevated p-4"
                  >
                    <div className="flex items-center gap-4 mb-3">
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

                      <div className="flex gap-2">
                        <motion.button
                          className="p-2 rounded-full bg-primary/10 text-primary"
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleMessage(match.user.id)}
                        >
                          <MessageCircle className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Photo/Video Grid Preview */}
                    {previewPhotos.length > 0 && (
                      <motion.div
                        onClick={() => navigate(`/user/${match.user.id}`)}
                        className="grid grid-cols-4 gap-1.5 mt-3"
                      >
                        {previewPhotos.map((url: string, photoIndex: number) => {
                          const isVideo = url.startsWith('data:video');
                          return (
                            <motion.div
                              key={photoIndex}
                              className="aspect-square rounded-lg overflow-hidden relative group"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {isVideo ? (
                                <>
                                  <video
                                    src={url.startsWith('data:video;') ? url.replace('data:video;', '') : url}
                                    className="w-full h-full object-cover"
                                    muted
                                  />
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <Play className="w-4 h-4 text-white drop-shadow-lg" />
                                  </div>
                                </>
                              ) : (
                                <img
                                  src={url}
                                  alt={`Photo ${photoIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                              {photoIndex === 3 && userPhotos.length > 4 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <span className="text-white text-xs font-semibold">+{userPhotos.length - 4}</span>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            )}
          </>
        )}

        {activeTab === 'pending' && (
          <>
            <p className="text-sm text-muted-foreground">
              {pendingLoading ? 'Loading...' : `${filteredPending.length} pending requests`}
            </p>
            
            {pendingLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : filteredPending.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              filteredPending.map((match, index) => (
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
                        Request sent {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}
                      </p>
                    </motion.button>
                  </div>

                  <div className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">
                    Pending
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            <p className="text-sm text-muted-foreground">
              {filteredRequests.length} connection requests
            </p>
            
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No connection requests</p>
              </div>
            ) : (
              filteredRequests.map((match, index) => {
                const userPhotos = match.user.photos || [];
                const previewPhotos = userPhotos.slice(0, 4);
                
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card-elevated p-4"
                  >
                    <div className="flex items-center gap-4 mb-3">
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
                            Wants to connect
                          </p>
                        </motion.button>
                      </div>

                      <div className="flex gap-2">
                        <motion.button
                          className="p-2 rounded-full bg-destructive/10 text-destructive"
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRejectRequest(match.id)}
                          disabled={updateMatch.isPending}
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          className="p-2 rounded-full bg-primary/10 text-primary"
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAcceptRequest(match.id)}
                          disabled={updateMatch.isPending}
                        >
                          <Check className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Photo/Video Grid Preview */}
                    {previewPhotos.length > 0 && (
                      <motion.div
                        onClick={() => navigate(`/user/${match.user.id}`)}
                        className="grid grid-cols-4 gap-1.5 mt-3"
                      >
                        {previewPhotos.map((url: string, photoIndex: number) => {
                          const isVideo = url.startsWith('data:video');
                          return (
                            <motion.div
                              key={photoIndex}
                              className="aspect-square rounded-lg overflow-hidden relative group"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {isVideo ? (
                                <>
                                  <video
                                    src={url.startsWith('data:video;') ? url.replace('data:video;', '') : url}
                                    className="w-full h-full object-cover"
                                    muted
                                  />
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <Play className="w-4 h-4 text-white drop-shadow-lg" />
                                  </div>
                                </>
                              ) : (
                                <img
                                  src={url}
                                  alt={`Photo ${photoIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                              {photoIndex === 3 && userPhotos.length > 4 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <span className="text-white text-xs font-semibold">+{userPhotos.length - 4}</span>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            )}
          </>
        )}
      </div>

      <BottomNav />
    </MobileLayout>
  );
};

export default ConnectionsPage;
