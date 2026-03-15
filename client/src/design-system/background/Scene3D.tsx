'use client';

/**
 * design-system/background/Scene3D.tsx
 * Fixed-position WebGL canvas behind all UI. Swaps scene based on active theme.
 */

import { Suspense, lazy, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { useThemeName } from '../theme-context';
import type { ThemeName } from '../tokens';

// Code-split each scene so only the active theme's module loads
const DarkScene      = lazy(() => import('./scenes/DarkScene').then(m => ({ default: m.DarkScene })));
const CyberpunkScene = lazy(() => import('./scenes/CyberpunkScene').then(m => ({ default: m.CyberpunkScene })));
const AuroraScene    = lazy(() => import('./scenes/AuroraScene').then(m => ({ default: m.AuroraScene })));

const SCENE_MAP: Record<ThemeName, React.FC> = {
  dark:      DarkScene as React.FC,
  cyberpunk: CyberpunkScene as React.FC,
  aurora:    AuroraScene as React.FC,
};

// Camera positions per theme
const CAMERA_MAP: Record<ThemeName, { position: [number, number, number]; fov: number }> = {
  dark:      { position: [0, 0, 8],  fov: 60 },
  cyberpunk: { position: [0, 2, 12], fov: 65 },
  aurora:    { position: [0, 0, 10], fov: 55 },
};

export function Scene3D() {
  const themeName = useThemeName();
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const SceneComponent = SCENE_MAP[themeName];
  const camera = CAMERA_MAP[themeName];

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        dpr={dpr}
        camera={camera}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
        }}
        style={{ background: 'transparent' }}
      >
        {/* Auto-degrade DPR on low-end devices */}
        <PerformanceMonitor
          onDecline={() => setDpr([1, 1])}
          onIncline={() => setDpr([1, 1.5])}
        />
        <Suspense fallback={null}>
          <SceneComponent />
        </Suspense>
      </Canvas>
    </div>
  );
}
