import { motion } from 'framer-motion';
import { BookOpen, MapPin, Clock, DollarSign, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import UserAvatar from '@/components/ui/UserAvatar';
import { Class } from '@/hooks/useClasses';

interface ClassCardProps extends Class {
  onEnroll?: (e?: React.MouseEvent) => void;
  isEnrolled?: boolean;
  onClick?: () => void;
}

const ClassCard = ({
  id,
  title,
  description,
  skill,
  category,
  image,
  startTime,
  price,
  schedule,
  venue,
  _count,
  onEnroll,
  isEnrolled,
  onClick,
}: ClassCardProps) => {
  return (
    <motion.div
      className="card-elevated rounded-2xl overflow-hidden cursor-pointer"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {skill}
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-1">{title}</h3>
          {venue && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span>{venue.name || 'Location TBD'}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-foreground line-clamp-2">{description}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {startTime && !isNaN(new Date(startTime).getTime()) && (
            <>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(startTime), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(startTime), 'h:mm a')}</span>
              </div>
            </>
          )}
          {price !== undefined && price !== null && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>${price}</span>
            </div>
          )}
        </div>

        {schedule && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{schedule}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{_count?.enrollments || 0} enrolled</span>
          </div>
          {onEnroll && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onEnroll(e);
              }}
              disabled={isEnrolled}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                isEnrolled
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary text-primary-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {isEnrolled ? 'Enrolled' : 'Enroll'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ClassCard;
