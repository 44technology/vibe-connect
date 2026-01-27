import { motion } from 'framer-motion';
import { Star, MapPin, Briefcase, Award, Users, GraduationCap, ChevronRight } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';

export interface Mentor {
  id: string;
  name: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  title?: string;
  company?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  studentsCount?: number;
  expertise?: string[];
  achievements?: string[];
  isVerified?: boolean;
  yearsOfExperience?: number;
  image?: string;
}

interface MentorCardProps {
  mentor: Mentor;
  onClick?: () => void;
}

const MentorCard = ({ mentor, onClick }: MentorCardProps) => {
  const displayName = mentor.displayName || mentor.name;
  const rating = mentor.rating || 4.5;
  const reviewCount = mentor.reviewCount || 0;
  const studentsCount = mentor.studentsCount || 0;

  return (
    <motion.div
      className="card-elevated rounded-2xl overflow-hidden cursor-pointer"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Cover Image or Gradient */}
      <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10">
        {mentor.image && (
          <img 
            src={mentor.image} 
            alt={displayName} 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Verified Badge */}
        {mentor.isVerified && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-card/90 backdrop-blur-sm flex items-center gap-1">
            <Award className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-foreground">Verified</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Avatar & Name */}
        <div className="flex items-start gap-3 -mt-12">
          <div className="relative">
            <UserAvatar 
              src={mentor.avatar} 
              alt={displayName} 
              size="lg"
            />
            {mentor.isVerified && (
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-primary border-2 border-background">
                <Award className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-2">
            <h3 className="font-bold text-foreground text-lg line-clamp-1">{displayName}</h3>
            {mentor.title && (
              <p className="text-sm text-muted-foreground line-clamp-1 flex items-center gap-1 mt-1">
                <Briefcase className="w-3 h-3" />
                {mentor.title}
                {mentor.company && ` @ ${mentor.company}`}
              </p>
            )}
            {mentor.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {mentor.location}
              </p>
            )}
          </div>
        </div>

        {/* Rating & Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-secondary text-secondary" />
            <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
            {reviewCount > 0 && (
              <span className="text-xs text-muted-foreground">({reviewCount})</span>
            )}
          </div>
          {studentsCount > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{studentsCount} students</span>
            </div>
          )}
          {mentor.yearsOfExperience && (
            <div className="flex items-center gap-1">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{mentor.yearsOfExperience} years</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {mentor.bio && (
          <p className="text-sm text-foreground line-clamp-2">{mentor.bio}</p>
        )}

        {/* Expertise Tags */}
        {mentor.expertise && mentor.expertise.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mentor.expertise.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {mentor.expertise.length > 3 && (
              <span className="px-2 py-1 rounded-lg bg-muted text-muted-foreground text-xs">
                +{mentor.expertise.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Achievements */}
        {mentor.achievements && mentor.achievements.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground line-clamp-1">
              {mentor.achievements[0]}
            </span>
          </div>
        )}

        {/* View Button */}
        <motion.button
          className="w-full mt-3 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-medium flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          View Classes
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MentorCard;
