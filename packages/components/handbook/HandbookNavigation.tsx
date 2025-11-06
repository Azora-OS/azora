/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
/**
 * 📖 HANDBOOK NAVIGATION - Access all documentation
 */

'use client';

import {
  Book,
  BookOpen,
  Crown,
  Heart,
  Scroll,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import NextLink from 'next/link';
import React from 'react';

export const HandbookNavigation: React.FC = () => {
  const books = [
    { title: 'Home', href: '/handbook', icon: Book },
    { title: 'Genesis', href: '/handbook/genesis', icon: Sparkles },
    { title: 'Commandments', href: '/handbook/commandments', icon: Crown },
    { title: 'Wisdom', href: '/handbook/wisdom', icon: BookOpen },
    { title: 'Parables', href: '/handbook/parables', icon: Heart },
    { title: 'Psalms', href: '/handbook/psalms', icon: Star },
    { title: 'Prophecies', href: '/handbook/prophecies', icon: Scroll },
    { title: 'Commission', href: '/handbook/commission', icon: Users },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="backdrop-blur-xl bg-white/5 border border-[#FFD700]/30 rounded-full px-6 py-3 shadow-2xl">
        <div className="flex items-center gap-2">
          {books.map((book, index) => (
            <NextLink
              key={index}
              href={book.href}
              className="group relative p-3 rounded-full hover:bg-[#FFD700]/20 transition-all"
              title={book.title}
            >
              <book.icon className="w-5 h-5 text-[#FFD700] group-hover:scale-125 transition-transform" />

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {book.title}
              </div>
            </NextLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
