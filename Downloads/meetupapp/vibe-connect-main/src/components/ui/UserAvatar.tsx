import { motion } from 'framer-motion';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  isActive?: boolean;
  hasStory?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const statusSizes = {
  sm: 'w-2 h-2 right-0 bottom-0',
  md: 'w-3 h-3 right-0 bottom-0',
  lg: 'w-4 h-4 right-0.5 bottom-0.5',
  xl: 'w-5 h-5 right-1 bottom-1',
};

const Avatar = ({ 
  src, 
  alt = 'User', 
  size = 'md', 
  isOnline = false,
  isActive = false,
  hasStory = false,
  onClick 
}: AvatarProps) => {
  return (
    <motion.div
      className={`relative ${onClick ? 'cursor-pointer' : ''}`}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onClick={onClick}
    >
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden ${
          hasStory ? 'ring-2 ring-offset-2 ring-offset-background ring-secondary' : ''
        }`}
      >
        {src ? (
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      {(isOnline || isActive) && (
        <span 
          className={`status-dot ${statusSizes[size]} ${
            isOnline ? 'status-online' : 'status-active'
          }`}
        />
      )}
    </motion.div>
  );
};

export default Avatar;
