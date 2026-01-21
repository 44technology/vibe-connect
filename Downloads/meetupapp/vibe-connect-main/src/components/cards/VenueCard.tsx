import { motion } from 'framer-motion';
import { MapPin, Star, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';

interface VenueCardProps {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  distance: string;
  priceRange?: string;
  isOpen?: boolean;
  hasDeals?: boolean;
  onPress?: () => void;
}

const VenueCard = ({
  name,
  category,
  image,
  rating,
  reviewCount,
  distance,
  priceRange,
  isOpen = true,
  hasDeals = false,
  onPress,
}: VenueCardProps) => {
  return (
    <motion.div
      className="card-interactive overflow-hidden w-[200px] flex-shrink-0"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
    >
      {/* Image */}
      <div className="relative h-28 overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        {hasDeals && (
          <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
            Deal
          </Badge>
        )}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-card/90 backdrop-blur-sm">
          <Star className="w-3 h-3 fill-secondary text-secondary" />
          <span className="text-xs font-medium">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-1">
        <h4 className="font-semibold text-foreground text-sm line-clamp-1">{name}</h4>
        <p className="text-xs text-muted-foreground">{category} {priceRange && `• ${priceRange}`}</p>
        
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{distance}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className={`text-xs font-medium ${isOpen ? 'text-friendme' : 'text-destructive'}`}>
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VenueCard;
