import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Filter, Star, MapPin, Clock, DollarSign, GraduationCap, Send, X } from 'lucide-react';
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

const classCategories = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'tennis', label: 'Tennis', emoji: '🎾' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘' },
  { id: 'swimming', label: 'Swimming', emoji: '🏊' },
  { id: 'golf', label: 'Golf', emoji: '⛳' },
  { id: 'skydiving', label: 'Skydiving', emoji: '🪂' },
  { id: 'cooking', label: 'Cooking', emoji: '👨‍🍳' },
  { id: 'dance', label: 'Dance', emoji: '💃' },
  { id: 'art', label: 'Art', emoji: '🎨' },
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
];

const ClassesPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);

  // Fetch classes from backend
  const { data: backendClasses, isLoading } = useClasses(
    searchQuery || undefined,
    selectedCategory !== 'all' ? selectedCategory : undefined,
    undefined,
    undefined,
    showEnrolledOnly
  );

  // Use backend classes if available, otherwise use mock data
  const allClasses = backendClasses && backendClasses.length > 0
    ? backendClasses.map(c => ({
        id: c.id,
        title: c.title,
        instructor: {
          name: 'Instructor', // Backend'de instructor field'ı yok
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          rating: 4.5,
        },
        category: c.category || 'all',
        location: c.venue?.name || 'Location TBD',
        distance: '0.5 mi',
        price: c.price || 0,
        duration: c.endTime 
          ? `${Math.round((new Date(c.endTime).getTime() - new Date(c.startTime).getTime()) / 60000)} min`
          : '1 hour',
        image: c.image || 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400',
        nextAvailable: new Date(c.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        students: c._count?.enrollments || 0,
      }))
    : classes;

  const filteredClasses = allClasses.filter(c => 
    (selectedCategory === 'all' || c.category === selectedCategory) &&
    (c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     c.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
        }),
      });
      toast.success('Your request has been submitted! We\'ll notify you when a class becomes available.');
      setShowSuggestionDialog(false);
      setSuggestionText('');
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
          <h1 className="text-xl font-bold text-foreground">Classes & Lessons</h1>
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
            className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
              showEnrolledOnly ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-5 h-5" />
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
              <img src={classItem.image} alt={classItem.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-card/90 backdrop-blur-sm flex items-center gap-1">
                <Star className="w-3 h-3 fill-secondary text-secondary" />
                <span className="text-xs font-medium">{classItem.instructor.rating}</span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-foreground">{classItem.title}</h3>
              
              <div className="flex items-center gap-2 mt-2">
                <UserAvatar src={classItem.instructor.avatar} alt={classItem.instructor.name} size="sm" />
                <span className="text-sm text-muted-foreground">{classItem.instructor.name}</span>
                <span className="text-xs text-muted-foreground">• {classItem.students} students</span>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{classItem.distance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{classItem.duration}</span>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-primary font-bold">
                  <DollarSign className="w-4 h-4" />
                  <span>${classItem.price}</span>
                </div>
                <span className="text-xs text-muted-foreground">{classItem.nextAvailable}</span>
              </div>
              
              <motion.button
                onClick={() => navigate(`/class/${classItem.id}`)}
                className="w-full mt-3 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-medium"
                whileTap={{ scale: 0.98 }}
              >
                Book Now
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuggestionDialog(false);
                  setSuggestionText('');
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
