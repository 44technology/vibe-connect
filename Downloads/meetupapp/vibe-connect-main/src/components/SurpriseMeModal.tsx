import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Dice5, Users, MapPin, Calendar, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMeetups, useJoinMeetup } from '@/hooks/useMeetups';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SurpriseMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SurpriseMeModal = ({ isOpen, onClose }: SurpriseMeModalProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isRolling, setIsRolling] = useState(false);
  const [selectedMeetup, setSelectedMeetup] = useState<any | null>(null);
  const [diceValue, setDiceValue] = useState(1);
  const [showAd, setShowAd] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(10);

  // Fetch blind meetups from API
  const { data: blindMeetups } = useMeetups({
    isBlindMeet: true,
    status: 'UPCOMING',
  });

  const joinMeetup = useJoinMeetup();

  const rollDice = () => {
    setIsRolling(true);
    setSelectedMeetup(null);
    
    // Animate dice rolling
    let rolls = 0;
    const maxRolls = 15;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      
      if (rolls >= maxRolls) {
        clearInterval(interval);
        setIsRolling(false);
        
        // Select random blind meetup from API
        if (!blindMeetups || blindMeetups.length === 0) {
          toast.error('No blind meetups available. Create one first!');
          return;
        }
        
        const randomMeetup = blindMeetups[Math.floor(Math.random() * blindMeetups.length)];
        setSelectedMeetup(randomMeetup);
        
        // Show ad for 10 seconds (mandatory, no skip)
        setShowAd(true);
        setAdTimeLeft(10);
        
        const adInterval = setInterval(() => {
          setAdTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(adInterval);
              setShowAd(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, 100);
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to join a vibe');
      navigate('/login');
      return;
    }

    if (!selectedMeetup) {
      toast.error('No meetup selected');
      return;
    }

    try {
      await joinMeetup.mutateAsync({ meetupId: selectedMeetup.id });
      toast.success('Successfully joined the blind vibe!');
      onClose();
      navigate(`/meetup/${selectedMeetup.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to join vibe');
    }
  };

  const resetAndClose = () => {
    setSelectedEvent(null);
    setIsRolling(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={resetAndClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-card rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-4 bg-gradient-primary text-center">
              <motion.button
                onClick={resetAndClose}
                className="absolute top-4 right-4 p-1"
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-primary-foreground/80" />
              </motion.button>
              <Sparkles className="w-8 h-8 mx-auto text-primary-foreground mb-2" />
              <h2 className="text-xl font-bold text-primary-foreground">Surprise Me!</h2>
              <p className="text-primary-foreground/80 text-sm">Roll the dice for a blind vibe</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {!selectedEvent ? (
                <div className="text-center">
                  {/* Dice */}
                  <motion.div
                    className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-lg"
                    animate={isRolling ? { 
                      rotateX: [0, 360, 720, 1080],
                      rotateY: [0, 360, 720, 1080],
                    } : {}}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  >
                    <span className="text-4xl font-bold text-primary-foreground">
                      {isRolling ? '?' : '🎲'}
                    </span>
                  </motion.div>

                  <p className="text-muted-foreground mb-6">
                    Join a mystery vibe where you won't see who else is joining until you meet in person!
                  </p>

                  <Button
                    onClick={rollDice}
                    disabled={isRolling}
                    className="w-full h-14 text-lg font-semibold bg-gradient-primary shadow-glow"
                  >
                    <Dice5 className="w-5 h-5 mr-2" />
                    {isRolling ? 'Rolling...' : 'Roll the Dice'}
                  </Button>
                </div>
              ) : showAd ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="mb-4">
                    <div className="w-full h-48 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="relative z-10 text-center">
                        <h3 className="text-2xl font-bold text-primary-foreground mb-2">Sponsored</h3>
                        <p className="text-primary-foreground/80">Check out our premium features!</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Ad ends in {adTimeLeft}s</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-1">{selectedMeetup.title}</h3>
                  {selectedMeetup.category && (
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                      {selectedMeetup.category}
                    </span>
                  )}

                  <div className="space-y-2 mb-6 text-left">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-foreground text-sm">
                        {selectedMeetup.venue?.name || selectedMeetup.location || 'Secret Location'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-foreground text-sm">
                        {selectedMeetup.startTime 
                          ? new Date(selectedMeetup.startTime).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'short', 
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })
                          : 'TBA'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-foreground text-sm">
                        {selectedMeetup._count?.members || 0} mystery attendees
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">
                    🎭 This is a blind vibe - you won't see other participants until you meet!
                  </p>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={rollDice}
                      className="flex-1 h-12"
                    >
                      Roll Again
                    </Button>
                    <Button
                      onClick={handleJoin}
                      disabled={joinMeetup.isPending}
                      className="flex-1 h-12 bg-gradient-primary"
                    >
                      {joinMeetup.isPending ? 'Joining...' : 'Join Blind Vibe'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SurpriseMeModal;
