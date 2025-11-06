/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { QuickStart } from '@/components/quick-start';
import { RecentUpdates } from '@/components/recent-updates';
import { Community } from '@/components/community';

export default function HomePage() {
  return (
    <div className="space-y-24">
      <Hero />
      <Features />
      <QuickStart />
      <RecentUpdates />
      <Community />
    </div>
  );
}

