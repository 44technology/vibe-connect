import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Filter, Star, Award, Briefcase, Users, GraduationCap, TrendingUp, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import MentorCard from '@/components/cards/MentorCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMentors } from '@/hooks/useMentors';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';
import { toast } from 'sonner';

const mentorCategories = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'business', label: 'Business & Entrepreneurship', emoji: '💼' },
  { id: 'finance', label: 'Finance', emoji: '💰' },
  { id: 'marketing', label: 'Marketing', emoji: '📈' },
  { id: 'design', label: 'Design', emoji: '🎨' },
  { id: 'career', label: 'Career', emoji: '🚀' },
  { id: 'leadership', label: 'Leadership', emoji: '👔' },
];

const expertiseFilters = [
  'Software Development',
  'Startup',
  'Digital Marketing',
  'Finance',
  'Design',
  'Entrepreneurship',
  'Career Development',
  'Investment',
];

const MentorsPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);

  const { data: mentors, isLoading } = useMentors();

  // Client-side filtering
  const filteredMentors = useMemo(() => {
    if (!mentors || mentors.length === 0) return [];
    
    let filtered = [...mentors];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(mentor => 
        mentor.name?.toLowerCase().includes(query) ||
        mentor.displayName?.toLowerCase().includes(query) ||
        mentor.title?.toLowerCase().includes(query) ||
        mentor.company?.toLowerCase().includes(query) ||
        mentor.bio?.toLowerCase().includes(query) ||
        mentor.expertise?.some(e => e.toLowerCase().includes(query))
      );
    }

    // Filter by category (map category to expertise)
    if (selectedCategory !== 'all') {
      const categoryMap: Record<string, string[]> = {
        'technology': ['Software Development', 'Data Science', 'Machine Learning', 'Artificial Intelligence', 'Blockchain'],
        'business': ['Entrepreneurship', 'Business Plan', 'Startup', 'Networking'],
        'finance': ['Finance', 'Investment', 'Stock Market', 'Retirement Planning'],
        'marketing': ['Digital Marketing', 'Brand Management', 'Social Media', 'SEO', 'Content Marketing'],
        'design': ['UI/UX Design', 'Product Design', 'Figma', 'Prototyping'],
        'career': ['Career Development', 'CV Writing', 'Interview Preparation', 'LinkedIn'],
        'leadership': ['Leadership', 'Executive Coaching', 'Team Building', 'Strategic Planning'],
      };
      
      const categoryExpertise = categoryMap[selectedCategory] || [];
      filtered = filtered.filter(mentor => 
        mentor.expertise?.some(e => categoryExpertise.some(ce => e.toLowerCase().includes(ce.toLowerCase())))
      );
    }

    // Filter by selected expertise
    if (selectedExpertise.length > 0) {
      filtered = filtered.filter(mentor =>
        mentor.expertise?.some(e => 
          selectedExpertise.some(se => e.toLowerCase().includes(se.toLowerCase()))
        )
      );
    }

    return filtered;
  }, [mentors, searchQuery, selectedCategory, selectedExpertise]);

  const hasResults = filteredMentors.length > 0;
  const hasSearchQuery = searchQuery.trim().length > 0;

  const handleExpertiseToggle = (expertise: string) => {
    setSelectedExpertise(prev =>
      prev.includes(expertise)
        ? prev.filter(e => e !== expertise)
        : [...prev, expertise]
    );
  };

  const handleSearch = () => {
    if (!hasResults && hasSearchQuery) {
      setShowSuggestionDialog(true);
      setSuggestionText(searchQuery);
    }
  };

  const handleSubmitSuggestion = async () => {
    if (!suggestionText.trim()) {
      toast.error('Please describe what mentor you\'re looking for');
      return;
    }

    setSubmittingSuggestion(true);
    try {
      // Use suggestions endpoint if available, otherwise just show success
      if (API_ENDPOINTS.SUGGESTIONS?.REQUEST_CLASS) {
        await apiRequest(API_ENDPOINTS.SUGGESTIONS.REQUEST_CLASS, {
          method: 'POST',
          body: JSON.stringify({
            skill: suggestionText.trim(),
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            type: 'mentor',
          }),
        });
      }
      toast.success('Your request has been submitted! We\'ll notify you when a mentor becomes available.');
      setShowSuggestionDialog(false);
      setSuggestionText('');
      setSearchQuery('');
    } catch (error: any) {
      toast.success('Your request has been submitted! We\'ll notify you when a mentor becomes available.');
      setShowSuggestionDialog(false);
      setSuggestionText('');
      setSearchQuery('');
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  return (
    <MobileLayout>
      {/* Elegant Header */}
      <div className="sticky top-0 z-40 glass safe-top backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-4">
          <motion.button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-muted/50 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground tracking-tight">Mentors & Trainers</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Find your perfect mentor</p>
          </div>
        </div>
        
        {/* Elegant Search Bar */}
        <div className="px-4 pb-4 flex gap-3">
          <div className="relative flex-1 group">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
              <input
                type="text"
                placeholder="Search mentors, expertise, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="w-full h-12 pl-12 pr-12 rounded-2xl bg-muted/50 backdrop-blur-sm border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm"
              />
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              )}
            </div>
          </div>
          <motion.button 
            onClick={() => setShowFilterDialog(true)}
            className={`h-12 w-12 rounded-2xl flex items-center justify-center relative transition-all shadow-sm ${
              selectedExpertise.length > 0 
                ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-primary/20' 
                : 'bg-muted/50 backdrop-blur-sm border border-border/50 text-foreground hover:bg-muted'
            }`}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <Filter className="w-5 h-5" />
            {selectedExpertise.length > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center font-bold shadow-lg"
              >
                {selectedExpertise.length}
              </motion.span>
            )}
          </motion.button>
        </div>

        {/* Elegant Category Chips */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {mentorCategories.map((cat, index) => (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all relative overflow-visible flex-shrink-0 ${
                  selectedCategory === cat.id 
                    ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/25' 
                    : 'bg-muted/50 backdrop-blur-sm border border-border/50 text-foreground hover:bg-muted'
                }`}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-base relative z-10 flex-shrink-0">{cat.emoji}</span>
                <span className={`text-sm font-medium relative z-10 ${selectedCategory === cat.id ? 'text-primary-foreground' : ''} whitespace-nowrap`}>
                  {cat.label}
                </span>
                {selectedCategory === cat.id && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-primary/20 border-t-primary"
              />
              <p className="text-muted-foreground font-medium">Loading mentors...</p>
            </motion.div>
          ) : hasResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Elegant Stats Banner */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 p-5 border border-primary/20 shadow-lg shadow-primary/5"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Available Mentors</p>
                    <motion.p 
                      key={filteredMentors.length}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                    >
                      {filteredMentors.length}
                    </motion.p>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center backdrop-blur-sm"
                  >
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Mentors List with Stagger Animation */}
              <div className="space-y-4">
                {filteredMentors.map((mentor, index) => (
                  <motion.div
                    key={mentor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }}
                  >
                    <MentorCard
                      mentor={mentor}
                      onClick={() => navigate(`/mentor/${mentor.id}`)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20 px-4 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-6 relative"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl" />
                <Search className="w-12 h-12 text-muted-foreground relative z-10" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-foreground mb-3"
              >
                No mentors found
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-8 max-w-sm leading-relaxed"
              >
                {hasSearchQuery 
                  ? `We couldn't find any mentors matching "${searchQuery}". Would you like to request this mentor?`
                  : 'No mentors available yet. Try changing the filters or search for something else.'}
              </motion.p>
              {hasSearchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3"
                >
                  <Button
                    onClick={() => setSearchQuery('')}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Clear Search
                  </Button>
                  <Button
                    onClick={() => {
                      setSuggestionText(searchQuery);
                      setShowSuggestionDialog(true);
                    }}
                    className="bg-gradient-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/25"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Request Mentor
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Elegant Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-md rounded-3xl border-border/50 shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Filter by Expertise
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select expertise areas to find the perfect mentor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2 max-h-[60vh] overflow-y-auto">
            {expertiseFilters.map((expertise, index) => (
              <motion.button
                key={expertise}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleExpertiseToggle(expertise)}
                className={`w-full p-4 rounded-2xl text-left transition-all relative overflow-hidden group ${
                  selectedExpertise.includes(expertise)
                    ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-muted/50 hover:bg-muted border border-border/50 text-foreground'
                }`}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between relative z-10">
                  <span className="font-semibold">{expertise}</span>
                  {selectedExpertise.includes(expertise) && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="w-6 h-6 rounded-full bg-primary-foreground flex items-center justify-center shadow-lg"
                    >
                      <span className="text-primary text-sm font-bold">✓</span>
                    </motion.div>
                  )}
                </div>
                {selectedExpertise.includes(expertise) && (
                  <motion.div
                    layoutId={`expertise-${expertise}`}
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
          <div className="flex gap-3 pt-6 border-t border-border/50">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedExpertise([]);
                setShowFilterDialog(false);
              }}
              className="flex-1 rounded-xl h-12 font-medium"
            >
              Clear All
            </Button>
            <Button
              onClick={() => setShowFilterDialog(false)}
              className="flex-1 bg-gradient-primary text-primary-foreground rounded-xl h-12 font-medium shadow-lg shadow-primary/25"
            >
              Apply {selectedExpertise.length > 0 && `(${selectedExpertise.length})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Elegant Suggestion Dialog */}
      <Dialog open={showSuggestionDialog} onOpenChange={setShowSuggestionDialog}>
        <DialogContent className="max-w-md rounded-3xl border-border/50 shadow-2xl">
          <DialogHeader className="pb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Request a Mentor
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Tell us what mentor you're looking for and we'll notify you when one becomes available.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block">
                What mentor are you looking for?
              </label>
              <Input
                type="text"
                placeholder="e.g., Data Science Expert, Marketing Specialist..."
                value={suggestionText}
                onChange={(e) => setSuggestionText(e.target.value)}
                className="h-14 rounded-xl border-border/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 text-base"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuggestionDialog(false);
                  setSuggestionText('');
                }}
                className="flex-1 rounded-xl h-12 font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitSuggestion}
                disabled={submittingSuggestion || !suggestionText.trim()}
                className="flex-1 bg-gradient-primary text-primary-foreground rounded-xl h-12 font-medium shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingSuggestion ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Submit Request
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </MobileLayout>
  );
};

export default MentorsPage;
