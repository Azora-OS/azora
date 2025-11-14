'use client';

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiProvider } from '@/lib/api-provider';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </ApiProvider>
    </QueryClientProvider>
  );
}
