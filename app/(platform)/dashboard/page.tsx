/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
import { Metadata } from 'next';
import { Suspense } from 'react';
import { DashboardLoading } from './components/DashboardLoading';
import { DashboardPage } from './components/DashboardPage/DashboardPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard - AZORA OS x AutoGPT x Dify x Stable Diffusion',
  description:
    'Your unified AI command center - manage agents, workflows, images, and more',
  applicationName: 'AZORA OS Dashboard',
  authors: [{ name: 'Azora AI Team' }],
  keywords: [
    'AI dashboard',
    'AutoGPT',
    'Dify',
    'Stable Diffusion',
    'LangChain',
    'Azora OS',
    'AI management',
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Dashboard - AZORA OS x AutoGPT x Dify x Stable Diffusion',
    description:
      'Your unified AI command center - manage agents, workflows, images, and more',
    type: 'website',
    siteName: 'AZORA OS Dashboard',
    images: [
      {
        url: '/images/dashboard-og.png',
        width: 1200,
        height: 630,
        alt: 'AZORA OS Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard - AZORA OS x AutoGPT x Dify x Stable Diffusion',
    description:
      'Your unified AI command center - manage agents, workflows, images, and more',
    images: ['/images/dashboard-twitter.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default async function DashboardPage(): Promise<React.ReactElement> {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardPage />
    </Suspense>
  );
}
