import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Briefcase, Award, Users, GraduationCap, Calendar, Clock, DollarSign, BookOpen, MessageCircle, Share2, CheckCircle2, ExternalLink } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMentor } from '@/hooks/useMentors';
import { useClasses } from '@/hooks/useClasses';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

const MentorDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { data: mentor, isLoading: mentorLoading } = useMentor(id!);
  const { data: classes, isLoading: classesLoading } = useClasses(undefined, undefined, undefined, undefined, false);

  // Filter classes by mentor (in a real app, this would be done via API)
  const mentorClasses = classes?.filter(c => 
    c.instructor?.name?.toLowerCase().includes(mentor?.name?.toLowerCase() || '') ||
    c.venue?.name?.toLowerCase().includes(mentor?.company?.toLowerCase() || '')
  ) || [];

  if (mentorLoading) {
    return (
      <MobileLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </MobileLayout>
    );
  }

  if (!mentor) {
    return (
      <MobileLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Mentor not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const displayName = mentor.displayName || mentor.name;
  const rating = mentor.rating || 4.5;
  const reviewCount = mentor.reviewCount || 0;
  const studentsCount = mentor.studentsCount || 0;

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
            <h1 className="font-bold text-foreground">Mentor Profile</h1>
            <div className="flex gap-2">
              <motion.button
                className="p-2 rounded-full bg-muted"
                whileTap={{ scale: 0.9 }}
                onClick={() => toast.info('Share feature coming soon')}
              >
                <Share2 className="w-5 h-5 text-foreground" />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Hero Section */}
          <div className="relative">
            {mentor.image ? (
              <div className="h-64 overflow-hidden">
                <img
                  src={mentor.image}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            
            <div className="px-4 -mt-20 relative z-10">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <UserAvatar 
                    src={mentor.avatar} 
                    alt={displayName} 
                    size="xl"
                  />
                  {mentor.isVerified && (
                    <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-primary border-4 border-background">
                      <Award className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <h2 className="mt-4 text-2xl font-bold text-foreground text-center">
                  {displayName}
                </h2>
                {mentor.title && (
                  <p className="text-muted-foreground text-center mt-1 flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {mentor.title}
                    {mentor.company && ` @ ${mentor.company}`}
                  </p>
                )}
                {mentor.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {mentor.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-6 space-y-6 -mt-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card-elevated p-4 rounded-2xl text-center">
                <Star className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{rating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">{reviewCount} reviews</p>
              </div>
              <div className="card-elevated p-4 rounded-2xl text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{studentsCount}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="card-elevated p-4 rounded-2xl text-center">
                <GraduationCap className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{mentor.yearsOfExperience || '-'}</p>
                <p className="text-xs text-muted-foreground">Years Experience</p>
              </div>
            </div>

            {/* Bio */}
            {mentor.bio && (
              <div className="card-elevated p-4 rounded-2xl">
                <h3 className="font-semibold text-foreground mb-2">About</h3>
                <p className="text-foreground leading-relaxed">{mentor.bio}</p>
              </div>
            )}

            {/* Expertise */}
            {mentor.expertise && mentor.expertise.length > 0 && (
              <div className="card-elevated p-4 rounded-2xl">
                <h3 className="font-semibold text-foreground mb-3">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {mentor.achievements && mentor.achievements.length > 0 && (
              <div className="card-elevated p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Başarılar & Ödüller</h3>
                </div>
                <div className="space-y-2">
                  {mentor.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Classes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground text-lg">Available Classes</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/classes')}
                >
                  View All
                </Button>
              </div>

              {classesLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading classes...</p>
                </div>
              ) : mentorClasses.length > 0 ? (
                <div className="space-y-3">
                  {mentorClasses.slice(0, 5).map((classItem) => (
                    <motion.div
                      key={classItem.id}
                      className="card-elevated p-4 rounded-2xl"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/class/${classItem.id}`)}
                    >
                      <div className="flex gap-4">
                        {classItem.image && (
                          <img
                            src={classItem.image}
                            alt={classItem.title}
                            className="w-20 h-20 rounded-xl object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground mb-1 line-clamp-1">
                            {classItem.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {classItem.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {classItem.startTime && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(classItem.startTime), 'MMM d')}</span>
                              </div>
                            )}
                            {classItem.price !== undefined && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                <span>${classItem.price}</span>
                              </div>
                            )}
                            {classItem._count?.enrollments !== undefined && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{classItem._count.enrollments}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <motion.button
                          className="p-2 rounded-lg bg-primary text-primary-foreground"
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/class/${classItem.id}`);
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="card-elevated p-8 rounded-2xl text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    This mentor doesn't have any classes yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 glass safe-bottom p-4 border-t border-border">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error('Please login to message');
                  navigate('/login');
                  return;
                }
                toast.info('Messaging feature coming soon');
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button
              className="flex-1 h-12 bg-gradient-primary text-primary-foreground"
              onClick={() => navigate('/classes')}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              View Classes
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MentorDetailPage;
