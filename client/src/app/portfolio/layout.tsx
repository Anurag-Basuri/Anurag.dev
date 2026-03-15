'use client';

import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary } from '@/design-system/error/ErrorBoundary';
import { ThemeSelector } from '@/design-system/ui/ThemeSelector';
import dynamic from 'next/dynamic';
import { Menu } from 'lucide-react';

const Sidebar = dynamic(
  () => import('@/features/sidebar/components/Sidebar').then(m => m.Sidebar),
  {
    ssr: false,
    loading: () => <div className="w-64 lg:w-72 shrink-0 animate-pulse bg-muted/10 rounded-xl" />,
  },
);

function TopBar() {
  return (
    <header className="h-12 w-full bg-background/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-30 relative">
      {/* Left: window controls + title */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5 items-center bg-white/5 px-2 py-1 rounded-md border border-white/10">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="text-sm font-semibold tracking-wide text-foreground/80 hidden sm:block">
          anurag-os
        </span>
      </div>

      {/* Right: nav actions + theme selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent('scroll-to-section', {
                detail: { sectionId: 'contact' },
              }),
            );
          }}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Contact
        </button>

        {/* Theme Selector */}
        <ThemeSelector />
      </div>
    </header>
  );
}

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background/70 font-sans text-foreground backdrop-blur-sm">
      <TopBar />

      <div className="flex-1 flex min-h-0 w-full overflow-hidden p-2 md:p-3 gap-2">
        {/* Sidebar */}
        <aside className="hidden md:flex rounded-xl bg-black/30 border border-white/10 w-64 lg:w-72 shrink-0 overflow-hidden backdrop-blur-md">
          <ErrorBoundary label="Sidebar">
            <Suspense fallback={<div className="h-full w-full animate-pulse bg-white/5" />}>
              <Sidebar />
            </Suspense>
          </ErrorBoundary>
        </aside>

        {/* Main content */}
        <main className="rounded-xl bg-black/20 border border-white/10 flex-1 min-h-0 overflow-hidden relative backdrop-blur-md">
          <ErrorBoundary label="Main Content">
            <Suspense fallback={<div className="h-full w-full animate-pulse bg-white/5" />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

