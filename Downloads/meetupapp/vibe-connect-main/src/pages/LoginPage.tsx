import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import uliMascot from '@/assets/uli-mascot.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Mail, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type LoginStep = 'welcome' | 'method' | 'phone' | 'complete';

const loginMethods = [
  { id: 'phone', label: 'Phone Number', icon: Phone, description: 'Sign in with phone number' },
  { id: 'google', label: 'Google', icon: Mail, description: 'Continue with Google' },
  { id: 'apple', label: 'Apple ID', icon: Smartphone, description: 'Continue with Apple' },
];

const messages: Record<LoginStep, string[]> = {
  welcome: [
    "Hey! Welcome back! 👋",
    "I'm Uli, let's get you signed in.",
    "How would you like to sign in?",
  ],
  method: [
    "Great choice!",
    "Let's continue...",
  ],
  phone: [
    "Perfect!",
    "What's your phone number?",
    "I'll send you a verification code.",
  ],
  otp: [
    "Check your phone! 📱",
    "I just sent you a code.",
    "Enter it here to continue.",
  ],
  complete: [
    "Welcome back! 🎉",
    "Let's find you some amazing people!",
  ],
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { verifyOTP, loginWithGoogle, loginWithApple } = useAuth();
  const [step, setStep] = useState<LoginStep>('welcome');
  const [messageIndex, setMessageIndex] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const currentMessages = messages[step];

  useEffect(() => {
    setMessageIndex(0);
    setShowInput(false);
    
    const showMessages = async () => {
      for (let i = 0; i < currentMessages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setMessageIndex(i + 1);
      }
      await new Promise(resolve => setTimeout(resolve, 400));
      setShowInput(true);
    };
    
    showMessages();
  }, [step, currentMessages.length]);

  const handleMethodSelect = async (methodId: string) => {
    setSelectedMethod(methodId);
    
    if (methodId === 'google') {
      setLoading(true);
      try {
        await loginWithGoogle();
        toast.success('Signed in with Google!');
        setStep('complete');
        setTimeout(() => navigate('/home'), 1500);
      } catch (error: any) {
        toast.error(error.message || 'Google sign in failed');
      } finally {
        setLoading(false);
      }
    } else if (methodId === 'apple') {
      setLoading(true);
      try {
        await loginWithApple();
        toast.success('Signed in with Apple!');
        setStep('complete');
        setTimeout(() => navigate('/home'), 1500);
      } catch (error: any) {
        toast.error(error.message || 'Apple sign in failed');
      } finally {
        setLoading(false);
      }
    } else if (methodId === 'phone') {
      setStep('phone');
    }
  };

  const handleSendOTP = async () => {
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
      
      // Skip OTP verification - directly verify with dummy code
      await verifyOTP(formattedPhone, '123456');
      toast.success('Signed in successfully!');
      setStep('complete');
      setTimeout(() => navigate('/home'), 1500);
    } catch (error: any) {
      console.error('Phone verification error:', error);
      toast.error(error.message || 'Failed to verify phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
      await verifyOTP(formattedPhone, otp);
      toast.success('Signed in successfully!');
      setStep('complete');
      setTimeout(() => navigate('/home'), 1500);
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = () => {
    if (!showInput) return null;

    switch (step) {
      case 'welcome':
        return (
          <div className="space-y-3 mt-4">
            {loginMethods.map((method) => {
              const Icon = method.icon;
              return (
                <motion.button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  disabled={loading}
                  className="w-full p-4 rounded-xl bg-card border border-border hover:bg-accent transition-colors text-left flex items-center gap-4"
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * loginMethods.indexOf(method) }}
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{method.label}</div>
                    <div className="text-sm text-muted-foreground">{method.description}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-4 mt-4">
            <div>
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-xl"
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleSendOTP}
              disabled={loading || !phone}
              className="w-full bg-gradient-primary h-12 text-lg font-semibold"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </Button>
            <button
              onClick={() => setStep('welcome')}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
          </div>
        );

      // OTP step removed - phone verification is automatic

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      <div className="relative flex-1 flex flex-col px-6 pt-12 pb-8 max-w-md mx-auto w-full">
        {/* ULI Mascot */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
        >
          <motion.img 
            src={uliMascot} 
            alt="ULI" 
            className="w-32 h-32 drop-shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Chat bubbles */}
        <div className="flex-1 space-y-3">
          <AnimatePresence mode="wait">
            {currentMessages.slice(0, messageIndex).map((message, index) => (
              <motion.div
                key={`${step}-${index}`}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-border"
              >
                <p className="text-foreground">{message}</p>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Input area */}
          <AnimatePresence>
            {renderInput() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {renderInput()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sign up link */}
        {step === 'welcome' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/onboarding')}
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
