import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface CategoryChipProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  variant?: 'default' | 'friendme' | 'loveme' | 'connectme';
}

const CategoryChip = ({ 
  icon: Icon, 
  label, 
  onClick, 
  isActive = false,
  variant = 'default' 
}: CategoryChipProps) => {
  const variantStyles = {
    default: isActive 
      ? 'bg-primary text-primary-foreground' 
      : 'bg-primary/10 text-primary',
    friendme: isActive 
      ? 'bg-friendme text-friendme-foreground' 
      : 'chip-friendme',
    loveme: isActive 
      ? 'bg-loveme text-loveme-foreground' 
      : 'chip-loveme',
    connectme: isActive 
      ? 'bg-connectme text-connectme-foreground' 
      : 'chip-connectme',
  };

  return (
    <motion.button
      onClick={onClick}
      className={`chip ${variantStyles[variant]}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </motion.button>
  );
};

export default CategoryChip;
