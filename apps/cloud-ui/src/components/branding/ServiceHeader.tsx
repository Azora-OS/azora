/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getServiceBrand } from '@/lib/branding/service-config';
import { Button } from '@/components/ui/button';
import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';

interface ServiceHeaderProps {
  servicePath?: string;
  className?: string;
}

export function ServiceHeader({ servicePath = 'app', className }: ServiceHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const brand = getServiceBrand(servicePath);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative h-10 w-32 transition-opacity group-hover:opacity-80">
            <Image
              src={brand.logo}
              alt={brand.name}
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-semibold">{brand.name}</span>
            <span className="text-xs text-muted-foreground">{brand.tagline}</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            href="/courses"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Courses
          </Link>
          <Link
            href="/achievements"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Achievements
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {isAuthenticated && user && (
            <div className="hidden md:flex items-center space-x-2 mr-2">
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
          )}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="h-9"
            >
              Logout
            </Button>
          ) : (
            <Link href="/auth/login">
              <Button
                variant="default"
                size="sm"
                className="h-9 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              >
                Sign In
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
