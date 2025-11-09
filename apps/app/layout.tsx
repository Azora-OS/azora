/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Azora OS - Constitutional AI Operating System | Serving All Humanity',
  description: 'A living organism built with divine inspiration. Constitutional AI serving 7.8 billion humans with universal wisdom, unconditional love, and eternal commitment. From Africa 🇿🇦 For Humanity 🌍 With Universal Love ✨',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/favicon.svg',
    shortcut: '/favicon.ico',
  },
  keywords: [
    'Constitutional AI',
    'Education Platform',
    'African Innovation',
    'Divine Technology',
    'Ubuntu Philosophy',
    'Living Operating System',
    'Azora OS',
    'Elara AI',
    'Sacred Technology',
  ],
  authors: [{ name: 'Azora ES (Pty) Ltd' }],
  creator: 'Azora ES (Pty) Ltd',
  publisher: 'Azora ES (Pty) Ltd',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Azora OS - Constitutional AI Operating System',
    description: 'A living organism built with divine inspiration serving humanity with universal wisdom and unconditional love',
    siteName: 'Azora OS',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Azora OS - Constitutional AI Operating System',
    description: 'A living organism built with divine inspiration serving humanity',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6750a4' },
    { media: '(prefers-color-scheme: dark)', color: '#d0bcff' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Azora OS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#6750a4" />
        <meta name="theme-color" content="#6750a4" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${inter.className} antialiased text-balance`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background text-foreground">
            {/* 💎 PREMIUM UI SYSTEM - Glassmorphic Background Pattern */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-premium-sapphire-500/5 via-premium-emerald-500/5 to-premium-ruby-500/5" />
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(12,124,232,0.1),transparent_50%)]" />
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
