import React from 'react';
import { motion } from 'framer-motion';

export const PremiumNavbar = ({
    title = 'AZORA FINANCE',
    subtitle,
    menuItems = [],
    actions,
}) => {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-lg border-b border-white/10"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            F
                        </div>
                        <div>
                            <span className="text-xl font-bold text-white tracking-wider">{title}</span>
                            {subtitle && (
                                <span className="hidden md:inline-block ml-2 text-xs text-blue-200 border-l border-white/20 pl-2">
                                    {subtitle}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        {menuItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="px-4 py-2 text-sm text-blue-100 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {actions}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-[1px]">
                            <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center">
                                <span className="text-xs">👤</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};
