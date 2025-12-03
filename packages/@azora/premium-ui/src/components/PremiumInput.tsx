import React from 'react';
import { clsx } from 'clsx';

export interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const PremiumInput: React.FC<PremiumInputProps> = ({
    label,
    error,
    icon,
    className,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-blue-200 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300">
                        {icon}
                    </div>
                )}
                <input
                    className={clsx(
                        'w-full bg-white/10 backdrop-blur-lg border border-white/20',
                        'rounded-lg px-4 py-3 text-white placeholder-blue-300',
                        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                        'transition-all duration-300',
                        error && 'border-red-500 focus:ring-red-500',
                        icon && 'pl-10',
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
};
