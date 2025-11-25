import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@azora/shared-design/theme/azora-theme.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Azora Classroom | Virtual Classrooms, Real Learning',
  description: 'Live Virtual Classrooms and Collaboration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
