'use client';

/**
 * components/providers/AppProviders.tsx
 * Unified provider tree — no next-themes dependency, we control themes ourselves.
 */

import type { ReactNode } from 'react';
import { Provider, createStore } from 'jotai';
import { Toaster } from 'react-hot-toast';
import { ThemeContextProvider } from '@/design-system/theme-context';
import { ErrorBoundary } from '@/design-system/error/ErrorBoundary';

const jotaiStore = createStore();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={jotaiStore}>
      <ThemeContextProvider>
        <ErrorBoundary label="App Root">
          {children}

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
  );
}
