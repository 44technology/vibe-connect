import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dice5, Users, MapPin, Calendar, Sparkles, Clock, GraduationCap, Monitor, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { useMeetups } from '@/hooks/useMeetups';
import { useJoinMeetup } from '@/hooks/useMeetups';
import { useClasses, useEnrollInClass } from '@/hooks/useClasses';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Helper functions for date/time formatting
const formatDate = (date: string | Date | undefined) => {
  if (!date) return 'TBA';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'TBA';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (time: string | Date | undefined) => {
  if (!time) return 'TBA';
  const t = new Date(time);
  if (isNaN(t.getTime())) return 'TBA';
  return t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatDateTime = (dateTime: string | Date | undefined) => {
  if (!dateTime) return 'TBA';
  const dt = new Date(dateTime);
  if (isNaN(dt.getTime())) return 'TBA';
  const dateStr = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${dateStr} at ${timeStr}`;
};

const SurpriseMePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isRolling, setIsRolling] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemType, setItemType] = useState<'vibe' | 'class' | null>(null);
  const [diceValue, setDiceValue] = useState(1);
  const [showAd, setShowAd] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(10);
  const [canRollToday, setCanRollToday] = useState(true);

  // Check if user can roll dice today (once per day)
  useEffect(() => {
    const lastRollDate = localStorage.getItem('surpriseMeLastRoll');
    if (lastRollDate) {
      const lastRoll = new Date(lastRollDate);
      const today = new Date();
      const isSameDay = lastRoll.toDateString() === today.toDateString();
      setCanRollToday(!isSameDay);
    } else {
      setCanRollToday(true);
    }
  }, []);

  // Fetch all upcoming meetups from API
  const { data: allMeetups, isLoading: meetupsLoading } = useMeetups({
    status: 'UPCOMING',
  });

  // Fetch all upcoming classes from API
  const { data: allClasses, isLoading: classesLoading } = useClasses(
    undefined,
    undefined,
    'UPCOMING'
  );

  const joinMeetup = useJoinMeetup();
  const enrollInClass = useEnrollInClass();

  // Check if meetup details should be revealed (2 hours before)
  // For "Surprise Me", we always hide details until 2 hours before, regardless of isBlindMeet
  const shouldRevealDetails = (meetup: any) => {
    if (!meetup?.startTime) return false;
    const startTime = new Date(meetup.startTime);
    const now = new Date();
    const twoHoursBefore = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);
    return now >= twoHoursBefore;
  };

  const rollDice = () => {
    if (!canRollToday) {
      toast.error('You can only roll the dice once per day! Come back tomorrow.');
      return;
    }

    setIsRolling(true);
    setSelectedItem(null);
    setItemType(null);
    
    // Animate dice rolling
    let rolls = 0;
    const maxRolls = 15;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      
      if (rolls >= maxRolls) {
        clearInterval(interval);
        setIsRolling(false);
        
        // Filter available meetups
        const availableMeetups = (allMeetups || []).filter((m: any) => {
          const startTime = new Date(m.startTime);
          const now = new Date();
          const maxAttendees = m.maxAttendees || 100;
          const currentAttendees = m._count?.members || 0;
          return startTime > now && currentAttendees < maxAttendees;
        });
        
        // Filter available classes
        const availableClasses = (allClasses || []).filter((c: any) => {
          const startTime = new Date(c.startTime);
          const now = new Date();
          const maxStudents = c.maxStudents || 100;
          const currentEnrollments = c._count?.enrollments || 0;
          return startTime > now && currentEnrollments < maxStudents;
        });
        
        if (availableMeetups.length === 0 && availableClasses.length === 0) {
          toast.error('No available vibes or classes at the moment. Try again later!');
          return;
        }
        
        // Randomly decide between vibe and class (50/50 chance if both available)
        let selectedType: 'vibe' | 'class';
        let selected: any;
        
        if (availableMeetups.length === 0) {
          selectedType = 'class';
          selected = availableClasses[Math.floor(Math.random() * availableClasses.length)];
        } else if (availableClasses.length === 0) {
          selectedType = 'vibe';
          selected = availableMeetups[Math.floor(Math.random() * availableMeetups.length)];
        } else {
          // Both available, random choice
          const randomChoice = Math.random();
          if (randomChoice < 0.5) {
            selectedType = 'vibe';
            selected = availableMeetups[Math.floor(Math.random() * availableMeetups.length)];
          } else {
            selectedType = 'class';
            selected = availableClasses[Math.floor(Math.random() * availableClasses.length)];
          }
        }
        
        setSelectedItem(selected);
        setItemType(selectedType);
        
        // Save roll date to localStorage
        localStorage.setItem('surpriseMeLastRoll', new Date().toISOString());
        setCanRollToday(false);
        
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
      toast.error('Please login to join');
      navigate('/login');
      return;
    }

    if (!selectedItem || !itemType) {
      toast.error('No item selected');
      return;
    }

    try {
      if (itemType === 'vibe') {
        await joinMeetup.mutateAsync({ meetupId: selectedItem.id });
        toast.success('Successfully joined the surprise vibe!');
        navigate(`/meetup/${selectedItem.id}`);
      } else {
        await enrollInClass.mutateAsync(selectedItem.id);
        toast.success('Successfully enrolled in the surprise class!');
        navigate(`/class/${selectedItem.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${itemType === 'vibe' ? 'join vibe' : 'enroll in class'}`);
    }
  };

  // Check if class is online or onsite
  const isClassOnline = (classItem: any) => {
    // If no latitude/longitude, it's online
    return !classItem.latitude || !classItem.longitude;
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
            {!selectedItem ? (
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
                <p className="text-muted-foreground mb-4">
                  Discover a random vibe or class! 🎲✨
                </p>
                {!canRollToday && (
                  <div className="mb-4 p-3 rounded-xl bg-muted border border-border">
                    <p className="text-sm text-muted-foreground">
                      ⏰ You've already rolled today! Come back tomorrow for another surprise.
                    </p>
                  </div>
                )}

                <Button
                  onClick={rollDice}
                  disabled={isRolling || meetupsLoading || classesLoading || !canRollToday}
                  className="w-full h-14 text-lg font-semibold bg-gradient-primary shadow-glow"
                >
                  <Dice5 className="w-5 h-5 mr-2" />
                  {isRolling ? 'Rolling...' : (meetupsLoading || classesLoading) ? 'Loading...' : !canRollToday ? 'Already Rolled Today' : 'Roll the Dice'}
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
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center card-elevated p-6 rounded-2xl"
              >
                {/* Dice Icon Badge */}
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-2xl">
                    {itemType === 'class' ? (
                      <GraduationCap className="w-10 h-10 text-primary-foreground" />
                    ) : (
                      <Sparkles className="w-10 h-10 text-primary-foreground" />
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-background">
                    <span className="text-lg">🎲</span>
                  </div>
                </div>
                
                {/* Dice Badge */}
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400/30 text-yellow-600 dark:text-yellow-400 text-sm font-bold">
                    <span className="text-lg">🎲</span>
                    <span>From Dice Roll</span>
                  </span>
                </div>

                {itemType === 'class' ? (
                  shouldRevealDetails(selectedItem) ? (
                    <>
                      <h3 className="text-xl font-bold text-foreground mb-1">{selectedItem.title}</h3>
                      <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                        <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold">
                          Surprise
                        </span>
                        {selectedItem.category && (
                          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium blur-sm select-none">
                            {selectedItem.category}
                          </span>
                        )}
                        {isClassOnline(selectedItem) ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium blur-sm select-none">
                            <Monitor className="w-3 h-3" />
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-friendme/10 text-friendme text-sm font-medium blur-sm select-none">
                            <Building2 className="w-3 h-3" />
                            Onsite
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-6 text-left">
                        {/* Instructor/Creator - Blur */}
                        {(selectedItem.instructor || selectedItem.creator) && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                            <Users className="w-5 h-5 text-primary" />
                            <span className="text-foreground text-sm blur-sm select-none">
                              {selectedItem.instructor?.displayName || selectedItem.creator?.displayName || 'Instructor'}
                            </span>
                          </div>
                        )}
                        {!isClassOnline(selectedItem) && selectedItem.venue && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                            <MapPin className="w-5 h-5 text-primary" />
                            <span className="text-foreground text-sm blur-sm select-none">
                              {selectedItem.venue.name} - {selectedItem.venue.address}
                            </span>
                          </div>
                        )}
                        {isClassOnline(selectedItem) && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                            <Monitor className="w-5 h-5 text-primary" />
                            <span className="text-foreground text-sm blur-sm select-none">Online Class</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                          <Calendar className="w-5 h-5 text-primary" />
                          <span className="text-foreground text-sm">
                            {formatDateTime(selectedItem.startTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                          <Users className="w-5 h-5 text-primary" />
                          <span className="text-foreground text-sm blur-sm select-none">
                            {selectedItem._count?.enrollments || 0} students
                            {selectedItem.maxStudents && ` / ${selectedItem.maxStudents}`}
                          </span>
                        </div>
                        {selectedItem.price !== undefined && selectedItem.price !== null && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                            <span className="text-foreground text-sm font-semibold blur-sm select-none">
                              {selectedItem.price === 0 ? 'FREE' : `$${selectedItem.price}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-foreground mb-1">Surprise Activity</h3>
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        ???
                      </span>

                      <div className="space-y-2 mb-6 text-left">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                          <MapPin className="w-5 h-5 text-primary" />
                          <span className="text-foreground text-sm blur-sm select-none">
                            Secret Location
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                          <Calendar className="w-5 h-5 text-primary" />
                          <span className="text-foreground text-sm">
                            {formatDate(selectedItem.startTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                          <Clock className="w-5 h-5 text-primary" />
                          <span className="text-foreground text-sm">
                            {formatTime(selectedItem.startTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                          <Users className="w-5 h-5 text-primary" />
                          <span className="text-foreground text-sm">
                            {selectedItem._count?.enrollments || 0} mystery participants
                          </span>
                        </div>
                      </div>

                      <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-xs text-primary font-medium">
                          🔒 Details will be revealed 2 hours before the activity
                        </p>
                      </div>
                    </>
                  )
                ) : shouldRevealDetails(selectedItem) ? (
                  <>
                    <h3 className="text-xl font-bold text-foreground mb-1">{selectedItem.title}</h3>
                    <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400/30 text-yellow-600 dark:text-yellow-400 text-sm font-bold">
                        <span>🎲</span>
                        <span>Dice Surprise</span>
                      </span>
                      {selectedItem.category && (
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium blur-sm select-none">
                          {selectedItem.category}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-6 text-left">
                      {/* Host/Creator - Blur */}
                      {(selectedItem.host || selectedItem.creator) && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                          <Users className="w-5 h-5 text-primary" />
                          <span className="text-foreground text-sm blur-sm select-none">
                            {selectedItem.host?.name || selectedItem.creator?.displayName || 
                             (selectedItem.creator ? `${selectedItem.creator.firstName} ${selectedItem.creator.lastName}` : 'Host')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="text-foreground text-sm blur-sm select-none">
                          {selectedItem.venue?.name || selectedItem.location || 'Secret Location'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="text-foreground text-sm">
                          {formatDateTime(selectedItem.startTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                        <Users className="w-5 h-5 text-primary" />
                        <span className="text-foreground text-sm blur-sm select-none">
                          {selectedItem._count?.members || 0} attendees
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-foreground mb-1">Mystery Vibe</h3>
                    <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400/30 text-yellow-600 dark:text-yellow-400 text-sm font-bold">
                        <span>🎲</span>
                        <span>Dice Surprise</span>
                      </span>
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        ???
                      </span>
                    </div>

                    <div className="space-y-2 mb-6 text-left">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="text-foreground text-sm blur-sm select-none">
                          Secret Location
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="text-foreground text-sm">
                          {formatDate(selectedItem.startTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                        <Clock className="w-5 h-5 text-primary" />
                        <span className="text-foreground text-sm">
                          {formatTime(selectedItem.startTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                        <Users className="w-5 h-5 text-primary" />
                        <span className="text-foreground text-sm">
                          {selectedItem._count?.members || 0} mystery attendees
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="text-xs text-primary font-medium">
                        🔒 Details will be revealed 2 hours before the event
                      </p>
                    </div>
                  </>
                )}

                <p className="text-xs text-muted-foreground mb-4">
                  🎭 Surprise {itemType === 'class' ? 'class' : 'vibe'}! {itemType === 'vibe' && 'Details will be revealed 2 hours before the event!'}
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedItem(null);
                      setItemType(null);
                    }}
                    className="flex-1 h-12"
                    disabled={!canRollToday}
                  >
                    {canRollToday ? 'Roll Again' : 'Tomorrow'}
                  </Button>
                  <Button
                    onClick={handleJoin}
                    className="flex-1 h-12 bg-gradient-primary"
                    disabled={enrollInClass.isPending || joinMeetup.isPending}
                  >
                    {itemType === 'class' 
                      ? (enrollInClass.isPending ? 'Enrolling...' : 'Join Surprise Activity')
                      : (joinMeetup.isPending ? 'Joining...' : 'Join Surprise Activity')
                    }
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
