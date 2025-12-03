import React from 'react';
import { TrinityGem } from '@azora/design-system';

interface TrinityStartButtonProps {
    active?: boolean;
}

export const TrinityStartButton: React.FC<TrinityStartButtonProps> = ({ active }) => {
    return (
        <button
            className={`relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
        ${active ? 'bg-white/10 shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'hover:bg-white/5'}
      `}
        >
            <div className={`transform transition-transform duration-500 ${active ? 'rotate-180 scale-110' : 'group-hover:rotate-90'}`}>
                {/* 
           Ideally we import TrinityGem, but if there are build issues with the package path, 
           we can fallback to a simplified SVG here. 
           For now, assuming the package import works as configured in package.json 
        */}
                <TrinityGem size={32} animated={true} glowIntensity={active ? 'high' : 'low'} showLabel={false} />
            </div>
        </button>
    );
};
