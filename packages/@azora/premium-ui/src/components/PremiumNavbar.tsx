import React from 'react';
import { clsx } from 'clsx';

export interface PremiumNavbarProps {
    logo?: React.ReactNode;
    title?: string;
    subtitle?: string;
    menuItems?: Array<{ label: string; href: string; }>;
    actions?: React.ReactNode;
    className?: string;
}

export const PremiumNavbar: React.FC<PremiumNavbarProps> = ({
    logo,
    title = 'AZORA',
    subtitle = "World's Best Education",
    menuItems = [],
    actions,
    className,
}) => {
    return (
        <nav className={clsx(
            'sticky top-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20',
            className
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo and Title */}
                    <div className="flex items-center gap-3">
                        {logo && <div className="h-10 w-auto">{logo}</div>}
                        <div>
                            <span className="text-xl font-bold text-white">{title}</span>
                            {subtitle && (
                                <p className="text-xs text-blue-300">{subtitle}</p>
                            )}
                        </div>
                    </div>

                    {/* Menu Items */}
                    {menuItems.length > 0 && (
                        <div className="hidden md:flex gap-8 items-center">
                            {menuItems.map((item, index) => (
                                <a
                                    key={index}
                                    href={item.href}
                                    className="text-sm text-white hover:text-blue-300 transition-colors"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    {actions && (
                        <div className="flex items-center gap-4">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
