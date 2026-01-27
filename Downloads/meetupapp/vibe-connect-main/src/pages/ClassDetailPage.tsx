import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, MapPin, Clock, DollarSign, Users, Calendar, Phone, Globe, CreditCard, AlertCircle, Info, Star, CheckCircle2, X, Monitor, CheckCircle, Sparkles, MessageCircle, ChevronRight } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useClass, useEnrollInClass, useCancelEnrollment } from '@/hooks/useClasses';
import { useMentor } from '@/hooks/useMentors';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ClassDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const isMentorClass = id?.startsWith('mentor-');
  const mentorId = isMentorClass ? id.replace('mentor-', '') : null;
  const { data: mentor, isLoading: mentorLoading } = useMentor(mentorId || '');
  const { data: classItem, isLoading: classLoading } = useClass(isMentorClass ? '' : id!);
  
  const isLoading = isMentorClass ? mentorLoading : classLoading;
  const enrollInClass = useEnrollInClass();
  const cancelEnrollment = useCancelEnrollment();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  const isEnrolled = classItem?.enrollments?.some((e) => e.user.id === user?.id) || false;
  const enrollment = classItem?.enrollments?.find((e) => e.user.id === user?.id);
  const isPaid = isEnrolled && enrollment && (enrollment.status === 'paid' || enrollment.status === 'enrolled') && classItem?.price && classItem.price > 0;
  
  // Check if class is online
  const isOnline = !classItem?.latitude || !classItem?.longitude;

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll');
      navigate('/login');
      return;
    }

    // If class has a price, show payment dialog
    if (classItem?.price && classItem.price > 0) {
      setShowPaymentDialog(true);
      return;
    }

    // Free class - enroll directly
    try {
      await enrollInClass.mutateAsync(id!);
      toast.success('Successfully enrolled in class!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll');
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCVC)) {
      toast.error('Please fill in all payment details');
      return;
    }

    try {
      await enrollInClass.mutateAsync(id!);
      setShowPaymentDialog(false);
      // Reset form
      setCardNumber('');
      setCardExpiry('');
      setCardCVC('');
      // Show success modal
      setShowSuccessDialog(true);
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    }
  };


  const handleCancel = async () => {
    try {
      await cancelEnrollment.mutateAsync(id!);
      toast.success('Enrollment cancelled');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel enrollment');
    }
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </MobileLayout>
    );
  }

  // Handle mentor classes - redirect to classes page with mentorship filter
  if (isMentorClass) {
    if (!mentor) {
      return (
        <MobileLayout>
          <div className="text-center py-12 px-4">
            <p className="text-muted-foreground mb-4">Mentor not found</p>
            <Button onClick={() => navigate('/classes')} className="mt-4">
              Go to Classes
            </Button>
          </div>
        </MobileLayout>
      );
    }
    return (
      <MobileLayout>
        <div className="text-center py-12 px-4">
          <p className="text-muted-foreground mb-4">Mentor profile: {mentor.displayName || mentor.name}</p>
          <p className="text-sm text-muted-foreground mb-6">
            View available mentorship classes from this mentor in the Classes page.
          </p>
          <Button onClick={() => navigate('/classes?category=mentorship')} className="mt-4">
            View Mentorship Classes
          </Button>
        </div>
      </MobileLayout>
    );
  }

  if (!classItem) {
    return (
      <MobileLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Class not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideNav>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 glass safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </motion.button>
            <h1 className="font-bold text-foreground">Class Details</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Hero Image */}
          <div className="relative h-80 overflow-hidden">
            {classItem.image ? (
              <img
                src={classItem.image}
                alt={classItem.title || 'Class'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <BookOpen className="w-24 h-24 text-primary/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-primary text-sm font-medium">
                  {classItem.skill || 'Class'}
                </span>
                {classItem.category && (
                  <span className="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-muted-foreground text-sm">
                    {classItem.category}
                  </span>
                )}
                {isOnline ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/90 backdrop-blur-sm text-secondary-foreground text-sm font-medium">
                    <Monitor className="w-3 h-3" />
                    Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-friendme/90 backdrop-blur-sm text-friendme-foreground text-sm font-medium">
                    <Building2 className="w-3 h-3" />
                    Onsite
                  </span>
                )}
                {isPaid && (
                  <span className="px-3 py-1 rounded-full bg-green-500/90 backdrop-blur-sm text-white text-sm font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Paid
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-card mb-2 drop-shadow-lg">
                {classItem.title || 'Untitled Class'}
              </h2>
              {classItem.price !== undefined && classItem.price !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-card drop-shadow-lg">
                    ${classItem.price}
                  </span>
                  {classItem.price === 0 && (
                    <span className="px-2 py-1 rounded-full bg-friendme/20 text-friendme text-xs font-medium">
                      FREE
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 py-6 space-y-6 -mt-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card-elevated p-4 rounded-2xl text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {classItem._count?.enrollments || 0}
                </p>
                <p className="text-xs text-muted-foreground">Enrolled</p>
              </div>
              <div className="card-elevated p-4 rounded-2xl text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {classItem.maxStudents ? classItem.maxStudents - (classItem._count?.enrollments || 0) : '∞'}
                </p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="card-elevated p-4 rounded-2xl text-center">
                <Star className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">4.8</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>

            {/* Class Description */}
            {classItem.description && (
              <div className="card-elevated p-4 rounded-2xl">
                <h3 className="font-semibold text-foreground mb-2">About This Class</h3>
                <p className="text-foreground leading-relaxed">{classItem.description}</p>
              </div>
            )}

            {/* Venue Info / Online Info */}
            {isOnline ? (
              <div className="card-elevated p-4 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Online Class</h3>
                    <p className="text-foreground">This class will be conducted online via video conference</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Meeting link will be shared after enrollment
                    </p>
                  </div>
                </div>
              </div>
            ) : classItem.venue ? (
              <div className="card-elevated p-4 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {classItem.venue.name || 'Location TBD'}
                    </h3>
                    {classItem.venue.address && (
                      <p className="text-sm text-muted-foreground">{classItem.venue.address}</p>
                    )}
                    {classItem.venue.city && (
                      <p className="text-sm text-muted-foreground">{classItem.venue.city}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Class Details */}
            <div className="card-elevated p-4 rounded-2xl space-y-3">
              <h3 className="font-semibold text-foreground mb-3">Class Details</h3>
              
              {classItem.startTime && (
                <>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium text-foreground">
                        {classItem.startTime ? format(new Date(classItem.startTime), 'EEEE, MMMM d, yyyy') : 'TBD'}
                      </p>
                    </div>
                  </div>

                  {classItem.startTime && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-medium text-foreground">
                          {format(new Date(classItem.startTime), 'h:mm a')}
                          {classItem.endTime && ` - ${format(new Date(classItem.endTime), 'h:mm a')}`}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {classItem.schedule && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Schedule</p>
                    <p className="font-medium text-foreground">{classItem.schedule}</p>
                  </div>
                </div>
              )}

              {classItem.price !== undefined && classItem.price !== null && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium text-foreground">${classItem.price}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Enrolled</p>
                  <p className="font-medium text-foreground">
                    {classItem._count?.enrollments || 0}
                    {classItem.maxStudents && ` / ${classItem.maxStudents}`} students
                  </p>
                </div>
              </div>
            </div>

            {/* Enrolled Students - Visible to everyone */}
            {classItem.enrollments && classItem.enrollments.length > 0 && (
              <div className="card-elevated p-4 rounded-2xl">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Class Participants ({classItem.enrollments.length})
                </h3>
                <div className="space-y-2">
                  {classItem.enrollments.map((enrollment) => {
                    const userName = enrollment.user?.displayName || `${enrollment.user?.firstName || ''} ${enrollment.user?.lastName || ''}`.trim() || 'Unknown User';
                    const isCurrentUser = enrollment.user?.id === user?.id;
                    
                    return (
                      <motion.button
                        key={enrollment.id}
                        onClick={() => {
                          if (!isCurrentUser && enrollment.user?.id) {
                            navigate(`/user/${enrollment.user.id}`);
                          }
                        }}
                        disabled={isCurrentUser}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          isCurrentUser 
                            ? 'bg-muted cursor-default' 
                            : 'bg-muted hover:bg-muted/80 active:bg-muted/60'
                        }`}
                        whileTap={!isCurrentUser ? { scale: 0.98 } : {}}
                      >
                        <UserAvatar
                          src={enrollment.user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                          alt={userName}
                          size="sm"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">
                            {userName}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-primary font-medium">(You)</span>
                            )}
                          </p>
                          {enrollment.status && (
                            <p className="text-xs text-muted-foreground capitalize">
                              {enrollment.status}
                            </p>
                          )}
                        </div>
                        {!isCurrentUser && (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                {classItem.enrollments.length > 10 && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Showing all {classItem.enrollments.length} participants
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 glass safe-bottom p-4 border-t border-border space-y-3">
          {isEnrolled ? (
            <>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl flex items-center justify-center gap-2"
                onClick={() => {
                  // Navigate to chat page and try to find/create class chat
                  navigate(`/chat?classId=${id}`);
                }}
              >
                <MessageCircle className="w-5 h-5" />
                Open Class Chat
              </Button>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl"
                  disabled
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {isPaid ? 'Enrolled (Paid)' : 'Enrolled'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl text-destructive border-destructive"
                  onClick={handleCancel}
                  disabled={cancelEnrollment.isPending}
                >
                  {cancelEnrollment.isPending ? 'Cancelling...' : 'Cancel Enrollment'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                onClick={handleEnroll}
                className="w-full h-12 rounded-xl bg-gradient-primary"
                disabled={enrollInClass.isPending || (classItem.maxStudents && (classItem._count?.enrollments || 0) >= classItem.maxStudents)}
              >
                {enrollInClass.isPending
                  ? 'Joining...'
                  : classItem.maxStudents && (classItem._count?.enrollments || 0) >= classItem.maxStudents
                  ? 'Class Full'
                  : classItem.price && classItem.price > 0
                  ? `Join the Class - $${classItem.price}`
                  : 'Join the Class (Free)'}
              </Button>
              {isEnrolled && (
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl flex items-center justify-center gap-2"
                  onClick={() => {
                    navigate(`/chat?classId=${id}`);
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Open Class Chat
                </Button>
              )}
            </>
          )}
        </div>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-md mx-4 rounded-2xl">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Pay ${classItem?.price} to enroll in this class
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Payment Method Selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border-2 ${
                      paymentMethod === 'card' ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border-2 ${
                      paymentMethod === 'cash' ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <DollarSign className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">Cash</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                      maxLength={19}
                      className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 2) {
                            setCardExpiry(value);
                          } else {
                            setCardExpiry(value.slice(0, 2) + '/' + value.slice(2, 4));
                          }
                        }}
                        maxLength={5}
                        className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        maxLength={3}
                        className="w-full h-12 px-4 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="p-4 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground">
                    You can pay in cash when you arrive at the class. Your enrollment will be confirmed after payment.
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">${classItem?.price}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentDialog(false);
                  setCardNumber('');
                  setCardExpiry('');
                  setCardCVC('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={enrollInClass.isPending || (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCVC))}
                className="flex-1 bg-gradient-primary"
              >
                {enrollInClass.isPending ? 'Processing...' : `Pay $${classItem?.price}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Success Modal - Slides in from right */}
        <AnimatePresence>
          {showSuccessDialog && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSuccessDialog(false)}
                className="fixed inset-0 bg-black/50 z-50"
              />
              
              {/* Success Modal */}
              <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 shadow-2xl"
                style={{ maxHeight: '100vh' }}
              >
                <div className="h-full flex flex-col">
                  {/* Close button */}
                  <div className="flex justify-end p-4">
                    <motion.button
                      onClick={() => setShowSuccessDialog(false)}
                      className="p-2 rounded-full hover:bg-muted transition-colors"
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-5 h-5 text-foreground" />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    {/* Success Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                      className="flex justify-center mb-6"
                    >
                      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                      </div>
                    </motion.div>

                    {/* Success Message */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center mb-6"
                    >
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        {t('paymentSuccessful')}
                      </h2>
                      <p className="text-base text-muted-foreground mb-3">
                        {t('assistantInfo')}
                      </p>
                    </motion.div>

                    {/* Class Schedule Info */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="w-full p-5 rounded-2xl bg-green-500/10 border-2 border-green-500/20 mb-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{classItem?.title}</p>
                          <p className="text-xs text-muted-foreground">{t('classInfo')}</p>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-medium">
                          {t('paymentCompleted')}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {classItem?.startTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="text-muted-foreground">{t('startDate')}:</span>
                            <span className="font-medium text-foreground">
                              {format(new Date(classItem.startTime), 'd MMMM yyyy, EEEE')}
                            </span>
                          </div>
                        )}
                        
                        {classItem?.endTime && classItem?.startTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="text-muted-foreground">{t('endDate')}:</span>
                            <span className="font-medium text-foreground">
                              {format(new Date(classItem.endTime), 'd MMMM yyyy')}
                            </span>
                          </div>
                        )}
                        
                        {classItem?.schedule && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="text-muted-foreground">{t('schedule')}:</span>
                            <span className="font-medium text-foreground">{classItem.schedule}</span>
                          </div>
                        )}
                        
                        {classItem?.startTime && classItem?.endTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="text-muted-foreground">{t('totalDuration')}:</span>
                            <span className="font-medium text-foreground">
                              {Math.ceil((new Date(classItem.endTime).getTime() - new Date(classItem.startTime).getTime()) / (1000 * 60 * 60 * 24 * 7))} {t('weeks')}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* What to Do Next */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="w-full mb-6"
                    >
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {t('whatToDo')}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-muted">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{t('waitForAssistant')}</p>
                            <p className="text-xs text-muted-foreground">{t('waitForAssistantDesc')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-muted">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{t('joinChat')}</p>
                            <p className="text-xs text-muted-foreground">{t('joinChatDesc')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-muted">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{t('checkNotifications')}</p>
                            <p className="text-xs text-muted-foreground">{t('checkNotificationsDesc')}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Action Button */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="w-full pb-4"
                    >
                      <Button
                        onClick={() => setShowSuccessDialog(false)}
                        className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground"
                      >
                        {t('backToDetails')}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </MobileLayout>
  );
};

export default ClassDetailPage;
