/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

'use client';

import { getServiceBrand } from '@/lib/branding/service-config';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { ServiceHeader } from './ServiceHeader';

interface ServiceLayoutProps {
  children: ReactNode;
  servicePath?: string;
  className?: string;
  showHeader?: boolean;
}

export function ServiceLayout({
  children,
  servicePath = 'app',
  className,
  showHeader = true,
}: ServiceLayoutProps) {
  const brand = getServiceBrand(servicePath);

  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {/* Brand-specific gradient background */}
      <div
        className={cn(
          'fixed inset-0 -z-10 bg-gradient-to-br',
          `bg-gradient-to-br ${brand.colors.gradient}`,
          'opacity-5 dark:opacity-10'
        )}
      />

      {showHeader && <ServiceHeader servicePath={servicePath} />}

      <main className="flex-1 relative">
        {children}
      </main>
    </div>
  );
}
