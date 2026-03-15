'use client';

import type { ReactNode } from 'react';
import { AppProviders } from '@/layout/AppProviders';
import { Scene3D } from '@/theme/Scene3D';

export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <AppProviders>
      <Scene3D />
      {children}
    </AppProviders>
  );
}
