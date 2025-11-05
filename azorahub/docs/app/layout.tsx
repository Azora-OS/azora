/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

import { Inter } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AzoraThemeProvider } from '@azorahub/ui';
import { Toaster } from '@/components/ui/toaster';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { SearchProvider } from '@/providers/search-provider';
import { Analytics } from '@/components/analytics';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'Azorahub Documentation',
    template: '%s | Azorahub Docs',
  },
  description: 'Comprehensive documentation for Azorahub - The Living Operating System',
  keywords: ['azorahub', 'documentation', 'os', 'operating system', 'development'],
  authors: [{ name: 'Azorahub Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://docs.azorahub.com',
    siteName: 'Azorahub Documentation',
    title: 'Azorahub Documentation',
    description: 'Comprehensive documentation for Azorahub - The Living Operating System',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Azorahub Documentation',
    description: 'Comprehensive documentation for Azorahub - The Living Operating System',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AzoraThemeProvider theme="light" mode="auto">
          <ThemeProvider>
            <CssBaseline />
            <SearchProvider>
              <div className="min-h-screen bg-background">
                <Navigation />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
              <Analytics />
            </SearchProvider>
          </ThemeProvider>
        </AzoraThemeProvider>
      </body>
    </html>
  );
}

