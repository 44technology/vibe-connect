import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import uliMascot from '@/assets/uli-mascot.png';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [showTagline, setShowTagline] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowTagline(true), 800);
    const timer2 = setTimeout(() => setShowButton(true), 1400);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <motion.div 
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ repeat: Infinity, duration: 4 }}
      />
      <motion.div 
        className="absolute bottom-40 right-10 w-40 h-40 rounded-full bg-secondary/20 blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ repeat: Infinity, duration: 5 }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Logo animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1, bounce: 0.4 }}
        >
          <motion.img 
            src={uliMascot} 
            alt="Lira" 
            className="w-40 h-40 mb-6 drop-shadow-2xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Brand name */}
        <motion.h1 
          className="text-5xl font-extrabold text-gradient mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          ULIKME
        </motion.h1>

        {/* Tagline */}
        <AnimatePresence>
          {showTagline && (
            <motion.p 
              className="text-lg text-muted-foreground mb-12"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              One app to find <span className="text-primary font-medium">people</span>,{' '}
              <span className="text-secondary font-medium">places</span>, and{' '}
              <span className="text-friendme font-medium">plans</span>.
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTA Button */}
        <AnimatePresence>
          {showButton && (
            <motion.button
              onClick={() => navigate('/onboarding')}
              className="w-full max-w-xs h-14 rounded-2xl bg-gradient-primary text-primary-foreground text-lg font-semibold shadow-glow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started
            </motion.button>
          )}
        </AnimatePresence>

        {/* Login link */}
        <AnimatePresence>
          {showButton && (
            <motion.p 
              className="mt-4 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </button>
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-8 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/30"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
};

export default WelcomePage;
