'use client';

/**
 * design-system/background/Scene3D.tsx
 * Single unified 3D background — floating particle field + wireframe mesh.
 * Reads theme colors via CSS custom properties for real-time reactive tinting.
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import type { Points, Mesh } from 'three';
import { useThemeName } from './theme-context';
import { THEMES } from './tokens';

// ─── Particle Field ────────────────────────────────────────────────────────────
function Particles({ count = 2000 }: { count?: number }) {
  const ref = useRef<Points>(null!);
  const themeName = useThemeName();
  const color = THEMES[themeName].primary;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 60;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.015;
    ref.current.rotation.x += delta * 0.003;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={color}
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── Wireframe Mesh ────────────────────────────────────────────────────────────
function FloatingGeo() {
  const ref = useRef<Mesh>(null!);
  const themeName = useThemeName();
  const primary = THEMES[themeName].primary;
  const secondary = THEMES[themeName].secondary;

  useFrame((state, delta) => {
    ref.current.rotation.x += delta * 0.12;
    ref.current.rotation.y += delta * 0.18;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.6;
  });

  return (
    <group>
      <mesh ref={ref} position={[3, 0, -5]} scale={2.2}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={primary} wireframe opacity={0.12} transparent />
      </mesh>
      <mesh position={[-3.5, 1, -7]} scale={1.6} rotation={[0.5, 0.3, 0]}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={secondary} wireframe opacity={0.08} transparent />
      </mesh>
    </group>
  );
}

// ─── Ambient Light that matches theme ──────────────────────────────────────────
function ThemeLight() {
  const themeName = useThemeName();
  const color = THEMES[themeName].primary;
  return (
    <>
      <ambientLight intensity={0.08} color={color} />
      <pointLight position={[6, 4, 4]} intensity={0.2} color={color} />
    </>
  );
}

// ─── Main Canvas ───────────────────────────────────────────────────────────────
export function Scene3D() {
  const [mounted, setMounted] = useState(false);
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

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
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
        }}
        style={{ background: 'transparent' }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr([1, 1])}
          onIncline={() => setDpr([1, 1.5])}
        />
        <Particles />
        <FloatingGeo />
        <ThemeLight />
      </Canvas>
    </div>
  );
}
