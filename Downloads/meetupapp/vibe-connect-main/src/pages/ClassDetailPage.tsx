import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, MapPin, Clock, DollarSign, Users, Calendar, Phone, Globe } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';
import { useClass, useEnrollInClass, useCancelEnrollment } from '@/hooks/useClasses';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ClassDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { data: classItem, isLoading } = useClass(id!);
  const enrollInClass = useEnrollInClass();
  const cancelEnrollment = useCancelEnrollment();

  const isEnrolled = classItem?.enrollments?.some((e) => e.user.id === user?.id) || false;

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll');
      navigate('/');
      return;
    }

    try {
      await enrollInClass.mutateAsync(id!);
      toast.success('Successfully enrolled in class!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll');
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

  if (!classItem) {
    return (
      <MobileLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Class not found</p>
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
          {classItem.image && (
            <div className="relative h-64 overflow-hidden">
              <img
                src={classItem.image}
                alt={classItem.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="px-4 py-6 space-y-6">
            {/* Class Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {classItem.skill}
                </span>
                {classItem.category && (
                  <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                    {classItem.category}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{classItem.title}</h2>
              <p className="text-foreground">{classItem.description}</p>
            </div>

            {/* Venue Info */}
            <div className="card-elevated p-4 rounded-2xl">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{classItem.venue.name}</h3>
                  <p className="text-sm text-muted-foreground">{classItem.venue.address}</p>
                  <p className="text-sm text-muted-foreground">{classItem.venue.city}</p>
                </div>
              </div>
            </div>

            {/* Class Details */}
            <div className="card-elevated p-4 rounded-2xl space-y-3">
              <h3 className="font-semibold text-foreground mb-3">Class Details</h3>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(classItem.startTime), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>

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

              {classItem.schedule && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Schedule</p>
                    <p className="font-medium text-foreground">{classItem.schedule}</p>
                  </div>
                </div>
              )}

              {classItem.price && (
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
                        src={enrollment.user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                        alt={enrollment.user.displayName || enrollment.user.firstName}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-foreground">
                          {enrollment.user.displayName || `${enrollment.user.firstName} ${enrollment.user.lastName}`}
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
        <div className="sticky bottom-0 glass safe-bottom p-4 border-t border-border">
          {isEnrolled ? (
            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full h-12 rounded-xl"
              disabled={cancelEnrollment.isPending}
            >
              {cancelEnrollment.isPending ? 'Cancelling...' : 'Cancel Enrollment'}
            </Button>
          ) : (
            <Button
              onClick={handleEnroll}
              className="w-full h-12 rounded-xl bg-gradient-primary"
              disabled={enrollInClass.isPending || (classItem.maxStudents && (classItem._count?.enrollments || 0) >= classItem.maxStudents)}
            >
              {enrollInClass.isPending
                ? 'Enrolling...'
                : classItem.maxStudents && (classItem._count?.enrollments || 0) >= classItem.maxStudents
                ? 'Class Full'
                : classItem.price
                ? `Enroll - $${classItem.price}`
                : 'Enroll Now'}
            </Button>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default ClassDetailPage;
