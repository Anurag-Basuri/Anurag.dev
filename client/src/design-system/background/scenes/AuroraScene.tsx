'use client';

/**
 * design-system/background/scenes/AuroraScene.tsx
 * Theme: Aurora — soft particle ribbons with sine-wave motion
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Points, BufferGeometry } from 'three';
import * as THREE from 'three';

const RIBBON_COUNT = 4;
const POINTS_PER_RIBBON = 600;

function AuroraRibbon({
  color,
  yOffset,
  speed,
  phase,
}: {
  color: string;
  yOffset: number;
  speed: number;
  phase: number;
}) {
  const ref = useRef<Points>(null!);

  const positions = useMemo(() => {
    const arr = new Float32Array(POINTS_PER_RIBBON * 3);
    for (let i = 0; i < POINTS_PER_RIBBON; i++) {
      const t = (i / POINTS_PER_RIBBON) * Math.PI * 2;
      arr[i * 3 + 0] = (i / POINTS_PER_RIBBON) * 30 - 15; // x spread
      arr[i * 3 + 1] = yOffset;
      arr[i * 3 + 2] = -8 + Math.sin(t * 3 + phase) * 3;
    }
    return arr;
  }, [yOffset, phase]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const posAttr = ref.current.geometry.attributes.position;
    for (let i = 0; i < POINTS_PER_RIBBON; i++) {
      const t = (i / POINTS_PER_RIBBON) * Math.PI * 4;
      posAttr.setY(
        i,
        yOffset + Math.sin(t + time * speed + phase) * 1.2,
      );
      posAttr.setZ(
        i,
        -8 + Math.cos(t * 0.5 + time * speed * 0.7) * 3,
      );
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={POINTS_PER_RIBBON}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={color}
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}

// Soft drifting spheres
function SoftOrbs() {
  const spheres = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        position: [(i - 2) * 4, (Math.random() - 0.5) * 3, -10 - i * 2] as [
          number,
          number,
          number,
        ],
        color: ['#8b5cf6', '#2dd4bf', '#a78bfa', '#5eead4', '#c4b5fd'][i] ?? '#8b5cf6',
        scale: 0.6 + Math.random() * 1.2,
        speed: 0.2 + Math.random() * 0.3,
      })),
    [],
  );

  const refs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    refs.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.position.y =
          spheres[i]!.position[1] + Math.sin(state.clock.elapsedTime * spheres[i]!.speed + i) * 0.8;
      }
    });
  });

  return (
    <>
      {spheres.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) refs.current[i] = el; }}
          position={s.position}
          scale={s.scale}
        >
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color={s.color} opacity={0.06} transparent />
        </mesh>
      ))}
    </>
  );
}

const RIBBON_CONFIGS = [
  { color: '#8b5cf6', yOffset: 1,   speed: 0.3, phase: 0 },
  { color: '#2dd4bf', yOffset: -0.5, speed: 0.4, phase: 1.2 },
  { color: '#a78bfa', yOffset: 2.5,  speed: 0.25, phase: 2.4 },
  { color: '#5eead4', yOffset: -2,   speed: 0.35, phase: 3.6 },
];

export function AuroraScene() {
  return (
    <>
      {RIBBON_CONFIGS.map((cfg, i) => (
        <AuroraRibbon key={i} {...cfg} />
      ))}
      <SoftOrbs />
      <ambientLight intensity={0.3} color="#c4b5fd" />
    </>
  );
}
