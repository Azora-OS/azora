import { cn } from '../utils/cn';

interface UbuntuGemProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

export function UbuntuGem({ size = 'md', animated = true, className }: UbuntuGemProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={cn(
      'relative flex items-center justify-center',
      sizeClasses[size],
      animated && 'animate-pulse',
      className
    )}>
      {/* Sapphire Apex */}
      <div className="absolute top-0 w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-ubuntu-sapphire" />

      {/* Emerald Foundation */}
      <div className="absolute bottom-0 w-full h-2 bg-ubuntu-emerald rounded-b" />

      {/* Ruby Core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 bg-ubuntu-ruby rounded-full" />
      </div>

      {/* Unity Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-ubuntu-sapphire/20 via-ubuntu-emerald/20 to-ubuntu-ruby/20 rounded-full blur-sm" />
    </div>
  );
}