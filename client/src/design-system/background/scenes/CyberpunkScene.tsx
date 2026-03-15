'use client';

/**
 * design-system/background/scenes/CyberpunkScene.tsx
 * Theme: Neon Grid — glowing ground plane + pulsating cubes
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh, Group } from 'three';
import * as THREE from 'three';

// Neon Grid Ground Plane
function NeonGrid() {
  return (
    <gridHelper
      args={[60, 30, '#22d3ee', '#150030']}
      position={[0, -3, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// Glitch cube cluster
function GlitchCubes() {
  const group = useRef<Group>(null!);
  const cubes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        position: [
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 6,
          -5 - Math.random() * 10,
        ] as [number, number, number],
        scale:    0.2 + Math.random() * 0.6,
        speed:    0.3 + Math.random() * 0.8,
        color:    i % 3 === 0 ? '#22d3ee' : i % 3 === 1 ? '#d946ef' : '#7c3aed',
        phase:    Math.random() * Math.PI * 2,
      })),
    [],
  );

  useFrame((state) => {
    group.current.children.forEach((child, i) => {
      const data = cubes[i];
      if (data) {
        child.rotation.x = state.clock.elapsedTime * data.speed;
        child.rotation.y = state.clock.elapsedTime * data.speed * 0.7;
        (child as Mesh).position.y =
          cubes[i]!.position[1] + Math.sin(state.clock.elapsedTime * data.speed + data.phase) * 0.5;
      }
    });
  });

  return (
    <group ref={group}>
      {cubes.map((cube, i) => (
        <mesh key={i} position={cube.position} scale={cube.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={cube.color} wireframe opacity={0.3} transparent />
        </mesh>
      ))}
    </group>
  );
}

// Scan-line rings
function ScanRings() {
  const ref = useRef<Group>(null!);
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.15;
  });

  return (
    <group ref={ref} position={[0, 0, -8]}>
      {[3, 5, 7].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.02, 8, 64]} />
          <meshBasicMaterial
            color={i === 1 ? '#d946ef' : '#22d3ee'}
            opacity={0.2 - i * 0.04}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

export function CyberpunkScene() {
  return (
    <>
      <NeonGrid />
      <GlitchCubes />
      <ScanRings />
      <ambientLight intensity={0.05} color="#22d3ee" />
      <pointLight position={[0, 4, -4]} intensity={0.5} color="#d946ef" />
      <pointLight position={[-4, -2, -6]} intensity={0.3} color="#22d3ee" />
    </>
  );
}
