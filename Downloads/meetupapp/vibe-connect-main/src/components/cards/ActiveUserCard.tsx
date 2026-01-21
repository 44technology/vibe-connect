import { motion } from 'framer-motion';
import UserAvatar from '../ui/UserAvatar';

interface ActiveUserCardProps {
  id: string;
  name: string;
  avatar?: string;
  activity: string;
  distance: string;
  hasStory?: boolean;
  onPress?: () => void;
}

const ActiveUserCard = ({
  name,
  avatar,
  activity,
  distance,
  hasStory = false,
  onPress,
}: ActiveUserCardProps) => {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 w-20"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onPress}
    >
      <UserAvatar 
        src={avatar} 
        alt={name} 
        size="lg" 
        isActive 
        hasStory={hasStory}
      />
      <div className="text-center">
        <p className="text-xs font-medium text-foreground line-clamp-1">{name}</p>
        <p className="text-[10px] text-muted-foreground line-clamp-1">{activity}</p>
        <p className="text-[10px] text-primary font-medium">{distance}</p>
      </div>
    </motion.div>
  );
};

export default ActiveUserCard;
