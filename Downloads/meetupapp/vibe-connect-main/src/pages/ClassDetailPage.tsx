import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, MapPin, Clock, DollarSign, Users, Calendar, Phone, Globe, CreditCard, AlertCircle, Info, Star, CheckCircle2, X, Monitor } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useClass, useEnrollInClass, useCancelEnrollment } from '@/hooks/useClasses';
import { useMentor } from '@/hooks/useMentors';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ClassDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const isMentorClass = id?.startsWith('mentor-');
  const mentorId = isMentorClass ? id.replace('mentor-', '') : null;
  const { data: mentor, isLoading: mentorLoading } = useMentor(mentorId || '');
  const { data: classItem, isLoading: classLoading } = useClass(isMentorClass ? '' : id!);
  
  const isLoading = isMentorClass ? mentorLoading : classLoading;
  const enrollInClass = useEnrollInClass();
  const cancelEnrollment = useCancelEnrollment();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  const isEnrolled = classItem?.enrollments?.some((e) => e.user.id === user?.id) || false;
  const enrollment = classItem?.enrollments?.find((e) => e.user.id === user?.id);
  
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
      toast.success('Payment successful! You are now enrolled.');
      // Reset form
      setCardNumber('');
      setCardExpiry('');
      setCardCVC('');
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

            {/* Enrolled Students */}
            {classItem.enrollments && classItem.enrollments.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Enrolled Students ({classItem.enrollments.length})
                </h3>
                <div className="space-y-2">
                  {classItem.enrollments.slice(0, 10).map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                      <UserAvatar
                        src={enrollment.user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                        alt={enrollment.user?.displayName || enrollment.user?.firstName || 'User'}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-foreground">
                          {enrollment.user?.displayName || `${enrollment.user?.firstName || ''} ${enrollment.user?.lastName || ''}`.trim() || 'Unknown User'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
                  Enrolled
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
                  ? 'Enrolling...'
                  : classItem.maxStudents && (classItem._count?.enrollments || 0) >= classItem.maxStudents
                  ? 'Class Full'
                  : classItem.price && classItem.price > 0
                  ? `Enroll Now - $${classItem.price}`
                  : 'Enroll Now (Free)'}
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
      </div>
    </MobileLayout>
  );
};

export default ClassDetailPage;
