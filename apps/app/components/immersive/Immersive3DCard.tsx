import React from 'react';

interface Immersive3DCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'crystal' | 'holographic' | 'neon' | 'glass' | 'iridescent';
}

export const Immersive3DCard: React.FC<Immersive3DCardProps> = ({ 
  children, 
  className = '', 
  variant = 'glass' 
}) => {
  const variantStyles = {
    crystal: 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-white/20 shadow-2xl shadow-purple-500/25',
    holographic: 'bg-gradient-to-br from-cyan-500/20 to-pink-500/20 backdrop-blur-xl border border-white/10 shadow-2xl shadow-cyan-500/25',
    neon: 'bg-gradient-to-br from-green-500/20 to-yellow-500/20 backdrop-blur-xl border border-green-500/30 shadow-2xl shadow-green-500/25',
    glass: 'bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl',
    iridescent: 'bg-gradient-to-br from-pink-500/20 to-violet-500/20 backdrop-blur-xl border border-pink-500/20 shadow-2xl shadow-pink-500/25'
  };

  return (
    <div className={`
      transform-gpu transition-all duration-500 
      hover:scale-105 hover:rotate-1 
      rounded-2xl p-6
      ${variantStyles[variant]}
      ${className}
    `}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Immersive3DCard;