import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  appName?: string;
  userName?: string;
}

export function AppLayout({ children, headerActions, appName, userName }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {headerActions && (
          <div className="flex justify-end mb-6">
            {headerActions}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
