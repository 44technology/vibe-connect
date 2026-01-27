import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Filter, Star, MapPin, Clock, DollarSign, GraduationCap, Send, X, Monitor, Building2, Users, Award, Tag, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import UserAvatar from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';
import { toast } from 'sonner';
import { useClasses } from '@/hooks/useClasses';
import { useMentors } from '@/hooks/useMentors';

const classCategories = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'tennis', label: 'Tennis', emoji: '🎾' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘' },
  { id: 'swimming', label: 'Swimming', emoji: '🏊' },
  { id: 'golf', label: 'Golf', emoji: '⛳' },
  { id: 'skydiving', label: 'Skydiving', emoji: '🪂' },
  { id: 'cooking', label: 'Cooking', emoji: '👨‍🍳' },
  { id: 'dance', label: 'Dance', emoji: '💃' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'language', label: 'Language', emoji: '🗣️' },
  { id: 'diction', label: 'Diction & Speech', emoji: '🎤' },
  { id: 'acting', label: 'Acting & Audition', emoji: '🎭' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'mentorship', label: 'Mentorship', emoji: '👔' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'photography', label: 'Photography', emoji: '📸' },
  { id: 'writing', label: 'Writing', emoji: '✍️' },
];

const classes = [
  {
    id: '1',
    title: 'Tennis Lessons for Beginners',
    instructor: { name: 'Coach Mike', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', rating: 4.9 },
    category: 'tennis',
    location: 'Flamingo Park Tennis Center',
    distance: '1.2 mi',
    price: 75,
    duration: '1 hour',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400',
    nextAvailable: 'Tomorrow, 9 AM',
    students: 48,
    hasCertificate: false,
  },
  {
    id: '2',
    title: 'Sunrise Yoga Flow',
    instructor: { name: 'Sarah Wellness', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', rating: 5.0 },
    category: 'yoga',
    location: 'Bayfront Park',
    distance: '0.8 mi',
    price: 25,
    duration: '75 min',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    nextAvailable: 'Today, 6 AM',
    students: 120,
  },
  {
    id: '3',
    title: 'Tandem Skydiving Experience',
    instructor: { name: 'Sky Adventures', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', rating: 4.8 },
    category: 'skydiving',
    location: 'Miami Skydive Center',
    distance: '25 mi',
    price: 299,
    duration: '3 hours',
    image: 'https://images.unsplash.com/photo-1521673252667-e05da380b252?w=400',
    nextAvailable: 'Sat, Jan 27',
    students: 312,
  },
  {
    id: '4',
    title: 'Golf Fundamentals',
    instructor: { name: 'Pro James', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', rating: 4.7 },
    category: 'golf',
    location: 'Doral Golf Resort',
    distance: '8 mi',
    price: 150,
    duration: '2 hours',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
    nextAvailable: 'Wed, Jan 24',
    students: 67,
  },
  {
    id: '5',
    title: 'Salsa Dance for Couples',
    instructor: { name: 'Maria & Carlos', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', rating: 4.9 },
    category: 'dance',
    location: 'Latin Dance Studio',
    distance: '2.1 mi',
    price: 40,
    duration: '1 hour',
    image: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400',
    nextAvailable: 'Fri, 7 PM',
    students: 89,
  },
  {
    id: '6',
    title: 'Italian Cooking Masterclass',
    instructor: { name: 'Chef Antonio', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', rating: 5.0 },
    category: 'cooking',
    location: 'Culinary Arts Center',
    distance: '3.5 mi',
    price: 95,
    duration: '2.5 hours',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
    nextAvailable: 'Sun, 11 AM',
    students: 156,
  },
  {
    id: '7',
    title: 'Public Speaking & Diction Mastery',
    instructor: { name: 'Prof. Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', rating: 4.9 },
    category: 'diction',
    location: 'Online',
    distance: 'Online',
    price: 45,
    duration: '1.5 hours',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
    nextAvailable: 'Mon, 7 PM',
    students: 234,
    isOnline: true,
    hasCertificate: true,
  },
  {
    id: '11',
    title: 'Free Diction & Pronunciation Workshop',
    instructor: { name: 'Voice Coach Emma', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', rating: 4.8 },
    category: 'diction',
    location: 'Online',
    distance: 'Online',
    price: 0,
    duration: '1 hour',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
    nextAvailable: 'Wed, 8 PM',
    students: 567,
    isOnline: true,
    hasCertificate: false,
  },
  {
    id: '12',
    title: 'Acting Audition Preparation Class',
    instructor: { name: 'Theater Director Mark', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', rating: 4.9 },
    category: 'acting',
    location: 'Downtown Theater Studio',
    distance: '2.3 mi',
    price: 120,
    duration: '2 hours',
    image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=400',
    nextAvailable: 'Sat, 2 PM',
    students: 89,
    hasCertificate: true,
  },
  {
    id: '13',
    title: 'Free Acting Workshop - Scene Study',
    instructor: { name: 'Actor Studio Miami', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', rating: 4.7 },
    category: 'acting',
    location: 'Actor Studio Miami',
    distance: '1.5 mi',
    price: 0,
    duration: '3 hours',
    image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=400',
    nextAvailable: 'Sun, 10 AM',
    students: 234,
    hasCertificate: false,
  },
  {
    id: '14',
    title: 'Spanish Language Course - Beginner',
    instructor: { name: 'Prof. Maria Garcia', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', rating: 5.0 },
    category: 'language',
    location: 'Online',
    distance: 'Online',
    price: 0,
    duration: '1.5 hours',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
    nextAvailable: 'Mon, 6 PM',
    students: 890,
    isOnline: true,
    hasCertificate: true,
  },
  {
    id: '15',
    title: 'Certified French Language Program',
    instructor: { name: 'Alliance Française', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', rating: 4.9 },
    category: 'language',
    location: 'Alliance Française Miami',
    distance: '3.2 mi',
    price: 299,
    duration: '10 weeks',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
    nextAvailable: 'Starts Feb 1',
    students: 156,
    hasCertificate: true,
  },
  {
    id: '16',
    title: 'Free Tennis Clinic - All Levels',
    instructor: { name: 'Community Sports Center', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', rating: 4.6 },
    category: 'tennis',
    location: 'Community Sports Center',
    distance: '0.9 mi',
    price: 0,
    duration: '2 hours',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400',
    nextAvailable: 'Sat, 9 AM',
    students: 234,
    hasCertificate: false,
  },
  {
    id: '17',
    title: 'Professional Tennis Coaching - Certified',
    instructor: { name: 'USPTA Pro Coach', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', rating: 5.0 },
    category: 'tennis',
    location: 'Elite Tennis Academy',
    distance: '5.1 mi',
    price: 150,
    duration: '1.5 hours',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400',
    nextAvailable: 'Tue, 4 PM',
    students: 45,
    hasCertificate: true,
  },
  {
    id: '8',
    title: 'AutoCAD for Construction Professionals',
    instructor: { name: 'Eng. Michael Chen', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', rating: 4.8 },
    category: 'tech',
    location: 'Online',
    distance: 'Online',
    price: 89,
    duration: '2 hours',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
    nextAvailable: 'Wed, 6 PM',
    students: 189,
    isOnline: true,
  },
  {
    id: '9',
    title: 'English Pronunciation & Accent Training',
    instructor: { name: 'Dr. Emily Roberts', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', rating: 5.0 },
    category: 'language',
    location: 'Online',
    distance: 'Online',
    price: 35,
    duration: '1 hour',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
    nextAvailable: 'Tue, 8 PM',
    students: 312,
    isOnline: true,
  },
  {
    id: '10',
    title: 'Digital Marketing Fundamentals',
    instructor: { name: 'Marketing Pro Lisa', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', rating: 4.7 },
    category: 'business',
    location: 'Online',
    distance: 'Online',
    price: 65,
    duration: '2 hours',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    nextAvailable: 'Thu, 7 PM',
    students: 456,
    isOnline: true,
  },
];

const ClassesPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionLocation, setSuggestionLocation] = useState<'online' | 'onsite' | 'both'>('both');
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [certificateFilter, setCertificateFilter] = useState<'all' | 'certified' | 'non-certified'>('all');

  // Fetch classes from backend
  const { data: backendClasses, isLoading } = useClasses(
    searchQuery || undefined,
    selectedCategory !== 'all' && selectedCategory !== 'mentorship' ? selectedCategory : undefined,
    undefined,
    undefined,
    showEnrolledOnly
  );

  // Fetch mentors (they are also instructors who can create classes)
  const { data: mentors } = useMentors(
    searchQuery || undefined,
    selectedCategory === 'mentorship' ? undefined : undefined
  );

  // Use backend classes if available, otherwise use mock data
  const backendClassesFormatted = backendClasses && backendClasses.length > 0
    ? backendClasses.map(c => ({
        id: c.id,
        title: c.title || 'Untitled Class',
        instructor: {
          name: (c as any).instructor?.name || c.venue?.name || 'Instructor',
          avatar: (c as any).instructor?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          rating: (c as any).instructor?.rating || 4.5,
        },
        category: c.category || 'all',
        location: c.venue?.name || 'Location TBD',
        distance: '0.5 mi',
        price: c.price || 0,
        duration: c.endTime && c.startTime
          ? `${Math.round((new Date(c.endTime).getTime() - new Date(c.startTime).getTime()) / 60000)} min`
          : '1 hour',
        image: c.image || 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400',
        nextAvailable: c.startTime 
          ? new Date(c.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          : 'TBD',
        students: c._count?.enrollments || 0,
        isOnline: !c.latitude || !c.longitude,
        hasCertificate: (c as any).hasCertificate || false,
        isMentor: false,
        mentor: undefined,
      }))
    : classes.map(c => ({ ...c, isOnline: c.isOnline || false, hasCertificate: (c as any).hasCertificate || false, isMentor: false, mentor: undefined }));

  // Convert mentors to class format (mentors can offer mentorship classes)
  const mentorClasses = useMemo(() => {
    if (!mentors || mentors.length === 0) return [];
    
    return mentors.map(mentor => ({
      id: `mentor-${mentor.id}`,
      title: `${mentor.displayName || mentor.name}'s Mentorship`,
      instructor: {
        name: mentor.displayName || mentor.name,
        avatar: mentor.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        rating: mentor.rating || 4.5,
      },
      category: 'mentorship',
      location: mentor.location || 'Online',
      distance: 'Online',
      price: 0, // Mentorship pricing can vary
      duration: 'Flexible',
      image: mentor.image || mentor.avatar || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
      nextAvailable: 'Available',
      students: mentor.studentsCount || 0,
      isOnline: true,
      isMentor: true,
      mentor: mentor,
      hasCertificate: false,
    }));
  }, [mentors]);

  // Combine classes and mentor classes
  const allClasses = [
    ...backendClassesFormatted,
    ...(selectedCategory === 'all' || selectedCategory === 'mentorship' ? mentorClasses : []),
  ];

  // Filter classes
  const filteredClasses = useMemo(() => {
    let filtered = allClasses.filter(c => {
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || 
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.instructor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    return filtered;
  }, [allClasses, selectedCategory, searchQuery]);

  const hasResults = filteredClasses.length > 0;
  const hasSearchQuery = searchQuery.trim().length > 0;

  const handleSearch = () => {
    if (!hasResults && hasSearchQuery) {
      setShowSuggestionDialog(true);
      setSuggestionText(searchQuery);
    }
  };

  const handleSubmitSuggestion = async () => {
    if (!suggestionText.trim()) {
      toast.error('Please describe what class you\'re looking for');
      return;
    }

    setSubmittingSuggestion(true);
    try {
      await apiRequest(API_ENDPOINTS.SUGGESTIONS.REQUEST_CLASS, {
        method: 'POST',
        body: JSON.stringify({
          skill: suggestionText.trim(),
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          location: suggestionLocation,
        }),
      });
      toast.success('Your request has been submitted! We\'ll notify you when a class becomes available.');
      setShowSuggestionDialog(false);
      setSuggestionText('');
      setSuggestionLocation('both');
      setSearchQuery('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            onClick={() => navigate('/discover')}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground">Classes & Mentorship</h1>
        </div>
        
        {/* Search */}
        <div className="px-4 pb-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <motion.button 
            onClick={() => setShowFilterDialog(true)}
            className={`h-12 w-12 rounded-2xl flex items-center justify-center relative ${
              (showEnrolledOnly || priceFilter !== 'all' || certificateFilter !== 'all') 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-foreground'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-5 h-5" />
            {(priceFilter !== 'all' || certificateFilter !== 'all') && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
            )}
          </motion.button>
        </div>

        {/* Categories */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {classCategories.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-foreground'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <span>{cat.emoji}</span>
                <span className="text-sm font-medium">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading classes...</p>
          </div>
        ) : hasResults ? (
          filteredClasses.map((classItem, index) => (
          <motion.div
            key={classItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card-elevated overflow-hidden"
          >
            <div className="relative h-36">
              <img src={(classItem as any).image} alt={classItem.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex items-center gap-2">
                {(classItem as any).isOnline && (
                  <div className="px-2 py-1 rounded-full bg-secondary/90 backdrop-blur-sm flex items-center gap-1">
                    <Monitor className="w-3 h-3 text-secondary-foreground" />
                    <span className="text-xs font-medium text-secondary-foreground">Online</span>
                  </div>
                )}
                <div className="px-2 py-1 rounded-full bg-card/90 backdrop-blur-sm flex items-center gap-1">
                  <Star className="w-3 h-3 fill-secondary text-secondary" />
                  <span className="text-xs font-medium">{(classItem as any).instructor?.rating || 4.5}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-foreground flex-1">{classItem.title}</h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {(classItem as any).isOnline && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                      <Monitor className="w-3 h-3" />
                      Online
                    </span>
                  )}
                  {(classItem as any).hasCertificate && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <Award className="w-3 h-3" />
                      Certified
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <UserAvatar src={(classItem as any).instructor?.avatar} alt={(classItem as any).instructor?.name} size="sm" />
                <span className="text-sm text-muted-foreground">{(classItem as any).instructor?.name}</span>
                <span className="text-xs text-muted-foreground">• {(classItem as any).students} students</span>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  {(classItem as any).isOnline ? (
                    <Monitor className="w-4 h-4" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  <span className="truncate">{(classItem as any).isOnline ? 'Online Class' : (classItem as any).distance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{(classItem as any).duration}</span>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 font-bold">
                  {(classItem as any).price === 0 || !(classItem as any).price ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <span>Free</span>
                    </span>
                  ) : (
                    <span className="text-primary flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${(classItem as any).price}</span>
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{(classItem as any).nextAvailable}</span>
              </div>
              
              <motion.button
                onClick={() => {
                  if ((classItem as any).isMentor && (classItem as any).mentor) {
                    // For mentors, navigate to class detail but show mentor info
                    // In production, mentor classes would have actual class IDs
                    navigate(`/class/${classItem.id}`);
                  } else {
                    navigate(`/class/${classItem.id}`);
                  }
                }}
                className="w-full mt-3 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-medium"
                whileTap={{ scale: 0.98 }}
              >
                {(classItem as any).isMentor ? 'View Profile' : 'Book Now'}
              </motion.button>
            </div>
          </motion.div>
          ))
        ) : hasSearchQuery ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No classes found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              We couldn't find any classes matching "{searchQuery}". Would you like to request this class?
            </p>
            <Button
              onClick={() => {
                setSuggestionText(searchQuery);
                setShowSuggestionDialog(true);
              }}
              className="bg-gradient-primary text-primary-foreground"
            >
              Request This Class
            </Button>
          </motion.div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Search for classes or browse by category</p>
          </div>
        )}
      </div>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Classes</DialogTitle>
            <DialogDescription>
              Filter classes by enrollment status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-primary" />
                <div>
                  <label className="text-sm font-medium text-foreground cursor-pointer">
                    Show Only Enrolled Classes
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Display only classes you're enrolled in
                  </p>
                </div>
              </div>
              <motion.button
                onClick={() => setShowEnrolledOnly(!showEnrolledOnly)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  showEnrolledOnly ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                  animate={{ x: showEnrolledOnly ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEnrolledOnly(false);
                  setShowFilterDialog(false);
                }}
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                onClick={() => setShowFilterDialog(false)}
                className="flex-1 bg-gradient-primary text-primary-foreground"
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suggestion Dialog */}
      <Dialog open={showSuggestionDialog} onOpenChange={setShowSuggestionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a Class</DialogTitle>
            <DialogDescription>
              Tell us what class you're looking for and we'll notify you when it becomes available.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                What class are you looking for?
              </label>
              <Input
                type="text"
                placeholder="e.g., Advanced Tennis Training, Yoga for Beginners..."
                value={suggestionText}
                onChange={(e) => setSuggestionText(e.target.value)}
                className="h-12"
                autoFocus
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Preferred Location Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <motion.button
                  onClick={() => setSuggestionLocation('online')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    suggestionLocation === 'online'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted bg-muted text-foreground'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Monitor className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs font-medium">Online</span>
                </motion.button>
                <motion.button
                  onClick={() => setSuggestionLocation('onsite')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    suggestionLocation === 'onsite'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted bg-muted text-foreground'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <MapPin className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs font-medium">Onsite</span>
                </motion.button>
                <motion.button
                  onClick={() => setSuggestionLocation('both')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    suggestionLocation === 'both'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted bg-muted text-foreground'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Circle className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs font-medium">Both</span>
                </motion.button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuggestionDialog(false);
                  setSuggestionText('');
                  setSuggestionLocation('both');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitSuggestion}
                disabled={submittingSuggestion || !suggestionText.trim()}
                className="flex-1 bg-gradient-primary text-primary-foreground"
              >
                {submittingSuggestion ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </MobileLayout>
  );
};

export default ClassesPage;
