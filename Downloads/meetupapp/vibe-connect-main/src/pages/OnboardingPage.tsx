import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import uliMascot from '@/assets/uli-mascot.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, Check, Users, Heart, Briefcase, Home, Phone, Mail, Smartphone, Camera, X, Upload, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { API_ENDPOINTS, apiRequest } from '@/lib/api';

type OnboardingStep = 'welcome' | 'method' | 'phone' | 'otp' | 'name' | 'birthday' | 'gender' | 'lookingFor' | 'interests' | 'photos' | 'selfie' | 'complete';

const signupMethods = [
  { id: 'phone', label: 'Phone Number', icon: Phone, description: 'Sign up with OTP code' },
  { id: 'google', label: 'Google', icon: Mail, description: 'Continue with Google' },
  { id: 'apple', label: 'Apple ID', icon: Smartphone, description: 'Continue with Apple' },
];

const genderOptions = [
  { id: 'male', label: 'Male', emoji: '👨' },
  { id: 'female', label: 'Female', emoji: '👩' },
  { id: 'nonbinary', label: 'Non-binary', emoji: '🧑' },
  { id: 'prefer-not', label: 'Prefer not to say', emoji: '🤐' },
];

const lookingForOptions = [
  { id: 'friendship', label: 'Friendship', icon: Users, color: 'friendme' },
  { id: 'dating', label: 'Dating', icon: Heart, color: 'loveme' },
  { id: 'networking', label: 'Networking', icon: Briefcase, color: 'connectme' },
];

const interestOptions = [
  // Coffee & Drinks
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'wine', label: 'Wine', emoji: '🍷' },
  { id: 'cocktails', label: 'Cocktails', emoji: '🍸' },
  { id: 'beer', label: 'Beer', emoji: '🍺' },
  { id: 'tea', label: 'Tea', emoji: '🫖' },
  
  // Sports (Expanded)
  { id: 'tennis', label: 'Tennis', emoji: '🎾' },
  { id: 'basketball', label: 'Basketball', emoji: '🏀' },
  { id: 'soccer', label: 'Soccer', emoji: '⚽' },
  { id: 'volleyball', label: 'Volleyball', emoji: '🏐' },
  { id: 'swimming', label: 'Swimming', emoji: '🏊' },
  { id: 'surfing', label: 'Surfing', emoji: '🏄' },
  { id: 'cycling', label: 'Cycling', emoji: '🚴' },
  { id: 'running', label: 'Running', emoji: '🏃' },
  { id: 'golf', label: 'Golf', emoji: '⛳' },
  { id: 'boxing', label: 'Boxing', emoji: '🥊' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'baseball', label: 'Baseball', emoji: '⚾' },
  { id: 'football', label: 'Football', emoji: '🏈' },
  { id: 'martial-arts', label: 'Martial Arts', emoji: '🥋' },
  { id: 'rock-climbing', label: 'Rock Climbing', emoji: '🧗' },
  { id: 'paddleboarding', label: 'Paddleboarding', emoji: '🏄‍♂️' },
  { id: 'kayaking', label: 'Kayaking', emoji: '🛶' },
  { id: 'diving', label: 'Diving', emoji: '🤿' },
  { id: 'skiing', label: 'Skiing', emoji: '⛷️' },
  { id: 'snowboarding', label: 'Snowboarding', emoji: '🏂' },
  { id: 'skating', label: 'Skating', emoji: '⛸️' },
  { id: 'hiking', label: 'Hiking', emoji: '🥾' },
  { id: 'crossfit', label: 'CrossFit', emoji: '🏋️' },
  { id: 'pilates', label: 'Pilates', emoji: '🧘‍♀️' },
  { id: 'dance-fitness', label: 'Dance Fitness', emoji: '💃' },
  
  // Latin Music & Dance (Miami - Expanded)
  { id: 'reggaeton', label: 'Reggaeton', emoji: '🎵' },
  { id: 'salsa', label: 'Salsa', emoji: '💃' },
  { id: 'bachata', label: 'Bachata', emoji: '💃' },
  { id: 'merengue', label: 'Merengue', emoji: '🎵' },
  { id: 'latin-jazz', label: 'Latin Jazz', emoji: '🎷' },
  { id: 'cumbia', label: 'Cumbia', emoji: '🎶' },
  { id: 'tango', label: 'Tango', emoji: '🕺' },
  { id: 'flamenco', label: 'Flamenco', emoji: '🎸' },
  { id: 'samba', label: 'Samba', emoji: '🥁' },
  { id: 'dembow', label: 'Dembow', emoji: '🎤' },
  { id: 'reggae', label: 'Reggae', emoji: '🎵' },
  { id: 'dancing', label: 'Dancing', emoji: '💃' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'live-music', label: 'Live Music', emoji: '🎸' },
  
  // Cuisine & Food (Expanded)
  { id: 'cooking', label: 'Cooking', emoji: '👨‍🍳' },
  { id: 'italian-food', label: 'Italian Cuisine', emoji: '🍝' },
  { id: 'japanese-food', label: 'Japanese Cuisine', emoji: '🍣' },
  { id: 'mexican-food', label: 'Mexican Cuisine', emoji: '🌮' },
  { id: 'french-food', label: 'French Cuisine', emoji: '🥐' },
  { id: 'thai-food', label: 'Thai Cuisine', emoji: '🍜' },
  { id: 'indian-food', label: 'Indian Cuisine', emoji: '🍛' },
  { id: 'chinese-food', label: 'Chinese Cuisine', emoji: '🥟' },
  { id: 'korean-food', label: 'Korean Cuisine', emoji: '🍲' },
  { id: 'mediterranean-food', label: 'Mediterranean', emoji: '🥙' },
  { id: 'caribbean-food', label: 'Caribbean Cuisine', emoji: '🍹' },
  { id: 'cuban-food', label: 'Cuban Cuisine', emoji: '🥪' },
  { id: 'peruvian-food', label: 'Peruvian Cuisine', emoji: '🍽️' },
  { id: 'brazilian-food', label: 'Brazilian Cuisine', emoji: '🍖' },
  { id: 'spanish-food', label: 'Spanish Cuisine', emoji: '🥘' },
  { id: 'greek-food', label: 'Greek Cuisine', emoji: '🫒' },
  { id: 'seafood', label: 'Seafood', emoji: '🦞' },
  { id: 'bbq', label: 'BBQ', emoji: '🍖' },
  { id: 'vegan', label: 'Vegan', emoji: '🥗' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
  { id: 'foodie', label: 'Foodie', emoji: '🍽️' },
  { id: 'fine-dining', label: 'Fine Dining', emoji: '🍴' },
  { id: 'street-food', label: 'Street Food', emoji: '🌯' },
  
  // Other Interests
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'reading', label: 'Reading', emoji: '📚' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'photography', label: 'Photography', emoji: '📷' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
  { id: 'theater', label: 'Theater', emoji: '🎭' },
  { id: 'comedy', label: 'Comedy', emoji: '😂' },
  { id: 'networking', label: 'Networking', emoji: '💼' },
  { id: 'beach', label: 'Beach', emoji: '🏖️' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌃' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘‍♀️' },
  { id: 'fashion', label: 'Fashion', emoji: '👗' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'entrepreneurship', label: 'Entrepreneurship', emoji: '🚀' },
];

const messages: Record<OnboardingStep, string[]> = {
  welcome: [
    "Hey there! 👋",
    "I'm Uli, your personal guide to meeting amazing people!",
    "Let's create your account to get started.",
    "How would you like to sign up?",
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
    "Enter it here to verify your number.",
  ],
  name: [
    "Perfect! Let's start with the basics.",
    "What should I call you? 😊",
  ],
  birthday: [
    "Nice to meet you!",
    "When's your birthday? I promise I won't forget it! 🎂",
  ],
  gender: [
    "Got it!",
    "How do you identify?",
  ],
  lookingFor: [
    "Almost there!",
    "What brings you to ULIKME? Select all that apply! ✨",
  ],
  interests: [
    "Awesome!",
    "What are you passionate about?",
    "Select up to 10 interests! Pick your hobbies and passions! 🎨",
  ],
  photos: [
    "Awesome!",
    "Let's add some photos to your profile.",
    "Add at least 2 photos so people can see the real you! 📸",
  ],
  selfie: [
    "Last step!",
    "Take a quick selfie to verify it's really you.",
    "This helps keep our community safe! ✨",
  ],
  complete: [
    "You're all set! 🎉",
    "Let's find you some amazing people to meet!",
  ],
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { register, sendOTP, verifyOTP, loginWithGoogle, loginWithApple } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [messageIndex, setMessageIndex] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

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
        // If Google login succeeds, user is registered, go to profile setup
        setStep('name');
      } catch (error: any) {
        toast.error(error.message || 'Google sign up failed');
      } finally {
        setLoading(false);
      }
    } else if (methodId === 'apple') {
      setLoading(true);
      try {
        await loginWithApple();
        // If Apple login succeeds, user is registered, go to profile setup
        setStep('name');
      } catch (error: any) {
        toast.error(error.message || 'Apple sign up failed');
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
      
      // Call API using apiRequest helper
      const data = await apiRequest<{ success: boolean; message: string; otp?: string }>(
        API_ENDPOINTS.AUTH.SEND_OTP,
        {
          method: 'POST',
          body: JSON.stringify({ phone: formattedPhone }),
        }
      );
      
      // Show OTP code in development
      if (data.otp) {
        toast.success(`OTP Code: ${data.otp}`, { 
          duration: 15000,
          description: 'Copy this code to verify your phone number'
        });
      } else {
        toast.success('OTP code sent! Check backend console for the code.');
      }
      
      setStep('otp');
    } catch (error: any) {
      console.error('OTP send error:', error);
      if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        toast.error('Cannot connect to server. Please make sure the backend is running on port 5000.');
      } else {
        toast.error(error.message || 'Failed to send OTP');
      }
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
      const response = await verifyOTP(formattedPhone, otp);
      
      // If user was created/authenticated, save token and go to home
      if (response && 'data' in response && response.data?.token) {
        setOtpVerified(true);
        toast.success('Phone verified!');
        // User already exists and is logged in, go to home
        setTimeout(() => navigate('/home'), 1000);
      } else {
        // OTP verified but user not created yet, continue to profile setup
        setOtpVerified(true);
        toast.success('Phone verified! Please complete your profile.');
        setStep('name');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleNameNext = () => {
    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' ') || nameParts[0] || '');
    setStep('birthday');
  };

  // Helper function to convert base64 to File
  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Helper function to upload image to Cloudinary via backend
  const uploadImage = async (base64: string): Promise<string> => {
    const file = base64ToFile(base64, `photo-${Date.now()}.png`);
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_ENDPOINTS.USERS.AVATAR}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Failed to upload image');
    }
    
    const data = await response.json();
    // Avatar endpoint returns { success: true, data: { id, avatar } }
    return data.data?.avatar || data.avatar || '';
  };

  const handleComplete = async () => {
    if (selectedMethod === 'phone' && !otpVerified) {
      toast.error('Please verify your phone number first');
      return;
    }

    setLoading(true);
    try {
      if (selectedMethod === 'phone') {
        const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
        const nameParts = name.trim().split(' ');
        const finalFirstName = firstName || nameParts[0] || '';
        const finalLastName = lastName || nameParts.slice(1).join(' ') || nameParts[0] || '';
        
        await register({
          phone: formattedPhone,
          firstName: finalFirstName,
          lastName: finalLastName,
          displayName: name,
          dateOfBirth: birthday ? new Date(birthday).toISOString() : undefined,
          authProvider: 'PHONE',
        });
      } else {
        // Google/Apple - user already registered, just update profile
        const nameParts = name.trim().split(' ');
        const finalFirstName = firstName || nameParts[0] || '';
        const finalLastName = lastName || nameParts.slice(1).join(' ') || nameParts[0] || '';
        
        await register({
          firstName: finalFirstName,
          lastName: finalLastName,
          displayName: name,
          dateOfBirth: birthday ? new Date(birthday).toISOString() : undefined,
          authProvider: selectedMethod === 'google' ? 'GOOGLE' : 'APPLE',
        });
      }

      // Upload photos and selfie to Cloudinary
      let uploadedPhotos: string[] = [];
      let uploadedSelfie: string | null = null;

      if (photos.length > 0) {
        toast.loading('Uploading photos...', { id: 'upload-photos' });
        uploadedPhotos = await Promise.all(
          photos.map(photo => uploadImage(photo))
        );
        toast.dismiss('upload-photos');
      }

      if (selfie) {
        toast.loading('Uploading selfie...', { id: 'upload-selfie' });
        uploadedSelfie = await uploadImage(selfie);
        toast.dismiss('upload-selfie');
      }

      // Update profile with all collected data
      toast.loading('Completing your profile...', { id: 'update-profile' });
      await apiRequest(API_ENDPOINTS.USERS.UPDATE, {
        method: 'PUT',
        body: JSON.stringify({
          gender,
          lookingFor,
          interests,
          photos: uploadedPhotos,
          selfie: uploadedSelfie,
        }),
      });
      toast.dismiss('update-profile');

      toast.success('Welcome to ULIKME!');
      setStep('complete');
      setTimeout(() => navigate('/home'), 1500);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const steps: OnboardingStep[] = ['welcome', 'method', 'phone', 'otp', 'name', 'birthday', 'gender', 'lookingFor', 'interests', 'photos', 'selfie', 'complete'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      // Skip steps based on selected method
      if (selectedMethod === 'google' || selectedMethod === 'apple') {
        if (step === 'method') {
          setStep('name');
          return;
        }
      }
      setStep(nextStep);
    } else {
      navigate('/home');
    }
  };

  const toggleLookingFor = (id: string) => {
    setLookingFor(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleInterest = (id: string) => {
    setInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).slice(0, 6 - photos.length).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPhotos(prev => [...prev, e.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSelfieCapture = () => {
    // In production, this would use camera API
    toast.info('Camera access would open here. For now, using placeholder.');
    setSelfie('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400');
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const renderInput = () => {
    if (!showInput) return null;

    switch (step) {
      case 'welcome':
        return (
          <div className="space-y-3 mt-4">
            {signupMethods.map((method) => {
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
                  transition={{ delay: 0.1 * signupMethods.indexOf(method) }}
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
              {loading ? 'Sending...' : 'Send Code'}
            </Button>
            <button
              onClick={() => setStep('welcome')}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
          </div>
        );

      case 'otp':
        return (
          <div className="space-y-4 mt-4">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
              <p className="text-sm text-muted-foreground mb-1">Development Mode</p>
              <p className="text-xs text-foreground">Check the toast notification above for your OTP code</p>
              <p className="text-xs text-muted-foreground mt-1">Or check backend console</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-2">Test Mode</p>
              <p className="text-xs text-muted-foreground mb-2">If OTP didn't arrive, use test code:</p>
              <div className="flex gap-2 justify-center">
                {['123456', '000000'].map((testCode) => (
                  <motion.button
                    key={testCode}
                    onClick={() => {
                      setOtp(testCode);
                      toast.info(`Test code ${testCode} entered`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-700 dark:text-yellow-300 text-xs font-medium transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    Use {testCode}
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="h-12 rounded-xl text-center text-2xl tracking-widest"
                maxLength={6}
                disabled={loading}
                autoFocus
              />
            </div>
            <Button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-primary h-12 text-lg font-semibold"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
          </Button>
            <div className="flex gap-2 justify-center text-sm">
              <button
                onClick={() => {
                  setOtp('');
                  setStep('phone');
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Change number
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="text-primary hover:underline"
              >
                Resend code
              </button>
            </div>
          </div>
        );

      case 'name':
        return (
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 text-lg text-center rounded-2xl border-2 border-primary/20 focus:border-primary"
            />
            <Button 
              onClick={handleNameNext} 
              disabled={!name.trim() || loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              Continue <ChevronRight className="ml-2" />
            </Button>
          </div>
        );

      case 'birthday':
        return (
          <div className="space-y-4 mt-4">
            <Input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="h-14 text-lg text-center rounded-2xl border-2 border-primary/20 focus:border-primary"
            />
            <Button 
              onClick={() => setStep('gender')} 
              disabled={!birthday || loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              Continue <ChevronRight className="ml-2" />
            </Button>
          </div>
        );

      case 'gender':
        return (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {genderOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setGender(option.id)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    gender === option.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-card'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <p className="mt-2 font-medium">{option.label}</p>
                </motion.button>
              ))}
            </div>
            <Button 
              onClick={() => setStep('lookingFor')} 
              disabled={!gender || loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              Continue <ChevronRight className="ml-2" />
            </Button>
          </div>
        );

      case 'lookingFor':
        return (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {lookingForOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = lookingFor.includes(option.id);
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => toggleLookingFor(option.id)}
                    className={`p-4 rounded-2xl border-2 transition-all relative ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-card'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <Icon className="w-8 h-8 mx-auto text-primary" />
                    <p className="mt-2 font-medium text-sm">{option.label}</p>
                  </motion.button>
                );
              })}
            </div>
            <Button 
              onClick={() => setStep('interests')} 
              disabled={lookingFor.length === 0 || loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              Continue <ChevronRight className="ml-2" />
            </Button>
          </div>
        );

      case 'interests':
        return (
          <div className="space-y-4 mt-4">
            <div className="text-center mb-2">
              <p className="text-sm text-muted-foreground">
                Selected: {interests.length} / 10
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
              {interestOptions.map((option) => {
                const isSelected = interests.includes(option.id);
                const isDisabled = !isSelected && interests.length >= 10;
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => toggleInterest(option.id)}
                    disabled={isDisabled}
                    className={`p-4 rounded-2xl border-2 transition-all relative ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : isDisabled
                        ? 'border-border bg-muted opacity-50 cursor-not-allowed'
                        : 'border-border bg-card'
                    }`}
                    whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <span className="text-3xl">{option.emoji}</span>
                    <p className="mt-1 font-medium text-xs">{option.label}</p>
                  </motion.button>
                );
              })}
            </div>
            <Button 
              onClick={() => setStep('photos')} 
              disabled={interests.length === 0 || loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              Continue <ChevronRight className="ml-2" />
            </Button>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-2">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="aspect-square rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted flex items-center justify-center">
                  {photos[index] ? (
                    <div className="relative w-full h-full">
                      <img src={photos[index]} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Photos
              </Button>
            </label>
            <Button 
              onClick={() => setStep('selfie')} 
              disabled={photos.length < 2 || loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              Continue <ChevronRight className="ml-2" />
            </Button>
            {photos.length < 2 && (
              <p className="text-xs text-center text-muted-foreground">
                Please add at least 2 photos
              </p>
            )}
          </div>
        );

      case 'selfie':
        return (
          <div className="space-y-4 mt-4">
            <div className="aspect-square rounded-2xl overflow-hidden border-2 border-primary bg-muted flex items-center justify-center">
              {selfie ? (
                <div className="relative w-full h-full">
                  <img src={selfie} alt="Selfie" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setSelfie(null)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center p-6">
                  <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Take a selfie</p>
                </div>
              )}
            </div>
            <Button
              onClick={handleSelfieCapture}
              variant="outline"
              className="w-full h-12"
            >
              <Camera className="w-4 h-4 mr-2" />
              {selfie ? 'Retake Selfie' : 'Take Selfie'}
            </Button>
            <Button 
              onClick={handleComplete} 
              disabled={!selfie || loading}
              className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Complete Sign Up'} <ChevronRight className="ml-2" />
            </Button>
          </div>
        );

      case 'complete':
        return (
          <Button onClick={() => navigate('/home')} className="w-full bg-gradient-primary h-14 text-lg font-semibold shadow-glow">
            Start Exploring! <ChevronRight className="ml-2" />
          </Button>
        );

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
          <AnimatePresence>
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

        {/* Sign in link */}
        {step === 'welcome' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
