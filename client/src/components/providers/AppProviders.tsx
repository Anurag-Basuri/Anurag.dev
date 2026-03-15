'use client';

/**
 * components/providers/AppProviders.tsx
 * Single unified provider tree for the entire app.
 * Replaces: jotai-provider.tsx + context-menu-provider.tsx (separated)
 */

import type { ReactNode } from 'react';
import { Provider, createStore } from 'jotai';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { ThemeContextProvider } from '@/design-system/theme-context';
import { ErrorBoundary } from '@/design-system/error/ErrorBoundary';
import { useMemo } from 'react';

const jotaiStore = createStore();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <Provider store={jotaiStore}>
        <ThemeContextProvider>
          <ErrorBoundary label="App Root">
            {children}

            {/* Global toast */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                className:
                  '!rounded-xl !border !border-white/10 !bg-black/90 !text-white !backdrop-blur-xl !shadow-2xl',
              }}
            />
          </ErrorBoundary>
        </ThemeContextProvider>
      </Provider>
    </ThemeProvider>
  );
}
