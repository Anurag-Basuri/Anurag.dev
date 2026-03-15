'use client';

/**
 * design-system/background/scenes/DarkScene.tsx
 * Theme: Deep Space — star field + rotating icosahedron wireframe
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { IcosahedronGeometry } from 'three';
import type { Mesh, Points, BufferGeometry, Material } from 'three';
import * as THREE from 'three';

// Star Field
function Stars({ count = 3000 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 80;
    }
    return arr;
  }, [count]);

  const ref = useRef<Points>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.02;
    ref.current.rotation.x += delta * 0.005;
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
        size={0.1}
        color="#88ffcc"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

// Icosahedron Wireframe
function FloatingMesh() {
  const ref = useRef<Mesh>(null!);

  useFrame((state, delta) => {
    ref.current.rotation.x += delta * 0.15;
    ref.current.rotation.y += delta * 0.25;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
  });

  return (
    <mesh ref={ref} position={[2, 0, -4]} scale={2}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color="#34d399" wireframe opacity={0.15} transparent />
    </mesh>
  );
}

// Second smaller mesh
function FloatingMesh2() {
  const ref = useRef<Mesh>(null!);

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta * 0.1;
    ref.current.rotation.z += delta * 0.2;
    ref.current.position.y = Math.cos(state.clock.elapsedTime * 0.4) * 0.8;
  });

  return (
    <mesh ref={ref} position={[-3, 1, -6]} scale={1.4}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#60a5fa" wireframe opacity={0.1} transparent />
    </mesh>
  );
}

export function DarkScene() {
  return (
    <>
      <Stars />
      <FloatingMesh />
      <FloatingMesh2 />
      <ambientLight intensity={0.1} color="#34d399" />
      <pointLight position={[5, 5, 5]} intensity={0.3} color="#34d399" />
    </>
  );
}
