import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dice5, Users, MapPin, Calendar, Sparkles, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';

const surpriseEvents = [
  { id: '1', title: 'Mystery Coffee Meetup', venue: 'Secret Location in Wynwood', time: 'Tomorrow, 10 AM', category: 'Coffee ☕', attendees: 4 },
  { id: '2', title: 'Blind Brunch Date', venue: 'Hidden Gem Restaurant', time: 'Sunday, 11 AM', category: 'Dining 🍽️', attendees: 6 },
  { id: '3', title: 'Adventure Sports Day', venue: 'Surprise Venue', time: 'Saturday, 2 PM', category: 'Sports 🎾', attendees: 8 },
  { id: '4', title: 'Creative Workshop', venue: 'Art District', time: 'Friday, 6 PM', category: 'Activities 🎨', attendees: 5 },
  { id: '5', title: 'Sunset Social', venue: 'Beach Location TBA', time: 'This Evening', category: 'Events 🎉', attendees: 12 },
];

const SurpriseMePage = () => {
  const navigate = useNavigate();
  const [isRolling, setIsRolling] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<typeof surpriseEvents[0] | null>(null);
  const [diceValue, setDiceValue] = useState(1);
  const [showAd, setShowAd] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(10);

  const rollDice = () => {
    setIsRolling(true);
    setSelectedEvent(null);
    
    // Animate dice rolling
    let rolls = 0;
    const maxRolls = 15;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      
      if (rolls >= maxRolls) {
        clearInterval(interval);
        setIsRolling(false);
        // Select random event
        const randomEvent = surpriseEvents[Math.floor(Math.random() * surpriseEvents.length)];
        setSelectedEvent(randomEvent);
        // Show ad for 10 seconds
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

  const handleJoin = () => {
    // Navigate to blind meet detail page (sample-3 is a blind meet)
    navigate('/meetup/sample-3');
  };

  return (
    <MobileLayout>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 glass safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-bold text-foreground">Surprise Me</h1>
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2"
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-foreground" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            {!selectedEvent ? (
              <div className="text-center">
                {/* Dice */}
                <motion.div
                  className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-2xl"
                  animate={isRolling ? { 
                    rotateX: [0, 360, 720, 1080],
                    rotateY: [0, 360, 720, 1080],
                  } : {}}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                >
                  <span className="text-6xl font-bold text-primary-foreground">
                    {isRolling ? '?' : '🎲'}
                  </span>
                </motion.div>

                <h2 className="text-2xl font-bold text-foreground mb-2">Roll the Dice</h2>
                <p className="text-muted-foreground mb-8">
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
                  <div className="w-full h-64 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 relative overflow-hidden">
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
                <Button
                  onClick={() => setShowAd(false)}
                  variant="outline"
                  className="w-full"
                >
                  Skip Ad
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center card-elevated p-6 rounded-2xl"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-1">{selectedEvent.title}</h3>
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  {selectedEvent.category}
                </span>

                <div className="space-y-2 mb-6 text-left">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-foreground text-sm">{selectedEvent.venue}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-foreground text-sm">{selectedEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-foreground text-sm">{selectedEvent.attendees} mystery attendees</span>
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
                    className="flex-1 h-12 bg-gradient-primary"
                  >
                    Join Blind Vibe
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </MobileLayout>
  );
};

export default SurpriseMePage;
