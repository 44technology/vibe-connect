import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Dice5, PartyPopper } from "lucide-react";

interface SurpriseMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mysteryVibes = [
  { title: "Mystery Coffee Date", emoji: "☕", attendees: 4 },
  { title: "Blind Brunch Club", emoji: "🥐", attendees: 6 },
  { title: "Secret Sunset Hike", emoji: "🌅", attendees: 8 },
  { title: "Anonymous Art Night", emoji: "🎨", attendees: 5 },
  { title: "Hidden Karaoke Party", emoji: "🎤", attendees: 10 },
];

const SurpriseMeModal = ({ isOpen, onClose }: SurpriseMeModalProps) => {
  const [isRolling, setIsRolling] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState<(typeof mysteryVibes)[0] | null>(null);

  const rollDice = () => {
    setIsRolling(true);
    setSelectedVibe(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * mysteryVibes.length);
      setSelectedVibe(mysteryVibes[randomIndex]);
      setIsRolling(false);
    }, 2000);
  };

  const handleClose = () => {
    setSelectedVibe(null);
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-3xl p-6 w-full max-w-sm border border-border"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">🎲 Surprise Me!</h2>
              <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center">
              {!selectedVibe ? (
                <>
                  <motion.div
                    animate={isRolling ? { rotate: 360 } : {}}
                    transition={{ duration: 0.5, repeat: isRolling ? Infinity : 0 }}
                    className="w-24 h-24 mx-auto mb-6 bg-secondary text-secondary-foreground rounded-2xl flex items-center justify-center"
                  >
                    <Dice5 className="w-12 h-12" />
                  </motion.div>

                  <p className="text-muted-foreground mb-6">
                    Roll the dice and join a mystery vibe! You won't see who else is joining until you arrive. 🎭
                  </p>

                  <button
                    onClick={rollDice}
                    disabled={isRolling}
                    className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold text-lg disabled:opacity-50"
                  >
                    {isRolling ? "Rolling..." : "Roll the Dice!"}
                  </button>
                </>
              ) : (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <PartyPopper className="w-16 h-16 mx-auto mb-4 text-secondary" />
                  <div className="text-6xl mb-4">{selectedVibe.emoji}</div>
                  <h3 className="text-xl font-bold mb-2">{selectedVibe.title}</h3>
                  <p className="text-muted-foreground mb-6">
                    {selectedVibe.attendees} mystery guests attending
                  </p>

                  <div className="space-y-3">
                    <button className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold">
                      Join Blind Vibe! 🎉
                    </button>
                    <button onClick={rollDice} className="w-full bg-muted py-3 rounded-2xl font-medium">
                      Roll Again
                    </button>
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
