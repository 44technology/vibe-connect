import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, MessageSquare, DollarSign, Clock, MapPin, User, Building2 } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import UserAvatar from '@/components/ui/UserAvatar';
import { useLearnRequest, useCreateLearnResponse } from '@/hooks/useLearn';
import { useVenues } from '@/hooks/useVenues';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

const LearnDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { data: learnRequest, isLoading } = useLearnRequest(id!);
  const { data: venues = [] } = useVenues();
  const createResponse = useCreateLearnResponse();
  
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseType, setResponseType] = useState<'USER' | 'VENUE'>('USER');
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState('');
  const [availability, setAvailability] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState('');

  const handleSubmitResponse = async () => {
    try {
      if (!message) {
        toast.error('Please enter a message');
        return;
      }

      if (responseType === 'VENUE' && !selectedVenueId) {
        toast.error('Please select a venue');
        return;
      }

      await createResponse.mutateAsync({
        learnRequestId: id!,
        message,
        price: price ? parseFloat(price) : undefined,
        availability: availability || undefined,
        responseType,
        venueId: responseType === 'VENUE' ? selectedVenueId : undefined,
      });

      toast.success('Response posted successfully!');
      setShowResponseForm(false);
      setMessage('');
      setPrice('');
      setAvailability('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to post response');
    }
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </MobileLayout>
    );
  }

  if (!learnRequest) {
    return (
      <MobileLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Learn request not found</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideNav>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 glass safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </motion.button>
            <h1 className="font-bold text-foreground">Learn Request</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {/* Learn Request Details */}
          <div className="card-elevated p-4 rounded-2xl">
            <div className="flex items-start gap-3 mb-4">
              <UserAvatar
                src={learnRequest.creator.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                alt={learnRequest.creator.displayName || learnRequest.creator.firstName}
                size="md"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground mb-1">{learnRequest.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {learnRequest.creator.displayName || `${learnRequest.creator.firstName} ${learnRequest.creator.lastName}`}
                </p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  learnRequest.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                  learnRequest.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {learnRequest.status}
                </span>
              </div>
            </div>

            {learnRequest.image && (
              <div className="mb-4 rounded-xl overflow-hidden">
                <img
                  src={learnRequest.image}
                  alt={learnRequest.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">{learnRequest.skill}</span>
                {learnRequest.category && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{learnRequest.category}</span>
                  </>
                )}
              </div>

              <p className="text-foreground">{learnRequest.description}</p>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Posted {format(new Date(learnRequest.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Responses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Responses ({learnRequest.responses?.length || 0})
              </h3>
              {user && learnRequest.status === 'OPEN' && (
                <Button
                  onClick={() => setShowResponseForm(!showResponseForm)}
                  size="sm"
                  variant="outline"
                >
                  {showResponseForm ? 'Cancel' : 'Respond'}
                </Button>
              )}
            </div>

            {/* Response Form */}
            {showResponseForm && user && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-elevated p-4 rounded-2xl mb-4 space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Respond as
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={responseType === 'USER' ? 'default' : 'outline'}
                      onClick={() => setResponseType('USER')}
                      className="flex-1"
                    >
                      <User className="w-4 h-4 mr-2" /> Individual
                    </Button>
                    <Button
                      variant={responseType === 'VENUE' ? 'default' : 'outline'}
                      onClick={() => setResponseType('VENUE')}
                      className="flex-1"
                    >
                      <Building2 className="w-4 h-4 mr-2" /> Venue
                    </Button>
                  </div>
                </div>

                {responseType === 'VENUE' && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Select Venue
                    </label>
                    <select
                      value={selectedVenueId}
                      onChange={(e) => setSelectedVenueId(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground"
                    >
                      <option value="">Choose a venue...</option>
                      {venues.map((venue) => (
                        <option key={venue.id} value={venue.id}>
                          {venue.name} - {venue.city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Message *
                  </label>
                  <Textarea
                    placeholder="Tell them how you can help..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="rounded-xl min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1">
                      <DollarSign className="w-4 h-4" /> Price (optional)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 50"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Availability
                    </label>
                    <Input
                      placeholder="e.g., Weekends"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmitResponse}
                  disabled={!message || createResponse.isPending}
                  className="w-full h-12 rounded-xl bg-gradient-primary"
                >
                  {createResponse.isPending ? 'Posting...' : 'Post Response'}
                </Button>
              </motion.div>
            )}

            {/* Responses List */}
            <div className="space-y-4">
              {learnRequest.responses && learnRequest.responses.length > 0 ? (
                learnRequest.responses.map((response) => (
                  <motion.div
                    key={response.id}
                    className="card-elevated p-4 rounded-2xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {response.responseType === 'USER' && response.user ? (
                        <>
                          <UserAvatar
                            src={response.user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                            alt={response.user.displayName || response.user.firstName}
                            size="sm"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-foreground">
                                {response.user.displayName || `${response.user.firstName} ${response.user.lastName}`}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : response.venue ? (
                        <>
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-foreground">{response.venue.name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{response.venue.address}, {response.venue.city}</p>
                          </div>
                        </>
                      ) : null}
                    </div>

                    <p className="text-foreground mb-3">{response.message}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {response.price && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${response.price}</span>
                        </div>
                      )}
                      {response.availability && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{response.availability}</span>
                        </div>
                      )}
                      <span>{format(new Date(response.createdAt), 'MMM d')}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No responses yet. Be the first to respond!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default LearnDetailPage;
