import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, BookOpen, Users, MapPin, MessageSquare, DollarSign, Clock } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';
import { useNavigate } from 'react-router-dom';
import { useLearnRequests } from '@/hooks/useLearn';
import { format } from 'date-fns';

const LearnPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: learnRequests = [], isLoading } = useLearnRequests(searchQuery || undefined);

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Learn</h1>
            </div>
            <motion.button
              onClick={() => navigate('/learn/create')}
              className="p-2 rounded-full bg-primary text-primary-foreground"
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="What do you want to learn? (e.g., Tennis, Cooking...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading learn requests...</p>
          </div>
        ) : learnRequests.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No learn requests yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to post what you want to learn!</p>
            <Button onClick={() => navigate('/learn/create')} className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" /> Create Learn Request
            </Button>
          </div>
        ) : (
          learnRequests.map((request) => (
            <motion.div
              key={request.id}
              className="card-elevated p-4 rounded-2xl"
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/learn/${request.id}`)}
            >
              <div className="flex items-start gap-3 mb-3">
                <UserAvatar
                  src={request.creator.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                  alt={request.creator.displayName || request.creator.firstName}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{request.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                      request.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {request.creator.displayName || `${request.creator.firstName} ${request.creator.lastName}`}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">{request.skill}</span>
                  {request.category && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{request.category}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-foreground line-clamp-2">{request.description}</p>
              </div>

              {request.image && (
                <div className="mb-3 rounded-xl overflow-hidden">
                  <img
                    src={request.image}
                    alt={request.title}
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{request._count?.responses || 0} responses</span>
                  </div>
                  <span>{format(new Date(request.createdAt), 'MMM d')}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/learn/${request.id}`);
                  }}
                >
                  View
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <BottomNav />
    </MobileLayout>
  );
};

export default LearnPage;
