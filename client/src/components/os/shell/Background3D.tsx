'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { useTheme } from 'next-themes';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { Points as ThreePoints } from 'three';
import * as THREE from 'three';

// --- Utilities ---

function usePrefersReducedMotion() {
	const [reduced, setReduced] = useState(false);

	useEffect(() => {
		const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
		if (!media) return;

		const onChange = () => setReduced(media.matches);
		onChange();

		if (media.addEventListener) {
			media.addEventListener('change', onChange);
			return () => media.removeEventListener('change', onChange);
		}

		media.addListener(onChange);
		return () => media.removeListener(onChange);
	}, []);

	return reduced;
}

function generateStarPoints(count: number, radius: number) {
	const points = new Float32Array(count * 3);
	for (let i = 0; i < count; i++) {
		const u = Math.random();
		const v = Math.random();
		const theta = 2 * Math.PI * u;
		const phi = Math.acos(2 * v - 1);
		const r = Math.cbrt(Math.random()) * radius;

		points[i * 3] = r * Math.sin(phi) * Math.cos(theta);
		points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
		points[i * 3 + 2] = r * Math.cos(phi);
	}
	return points;
}

// --- Components ---

function MovingGrid({ reducedMotion }: { reducedMotion: boolean }) {
	const gridRef = useRef<THREE.Group>(null);
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	// Colors
	const gridColor = isDark ? '#10b981' : '#6366f1'; // Emerald vs Indigo
	const opacity = isDark ? 0.2 : 0.15;

	useFrame((state, delta) => {
		if (reducedMotion || !gridRef.current) return;

		// Move grid towards camera (z-axis positive)
		// We use a group with two identical grids to simulate infinity
		gridRef.current.position.z = (state.clock.elapsedTime * 0.8) % 2;
	});

	return (
		<group ref={gridRef} position={[0, -2, 0]}>
			<gridHelper
				args={[60, 60, gridColor, gridColor]}
				position={[0, 0, 0]}
				rotation={[0, 0, 0]}
			>
				<meshBasicMaterial
					attach="material"
					color={gridColor}
					transparent
					opacity={opacity}
					depthWrite={false}
				/>
			</gridHelper>
			{/* Second grid for seamless loop if needed, but modulo usually handles it with just one if large enough relative to movement. 
                Actually, simpler approach: Just one large grid moving. Modulo 1 cell unit (1) to reset.
                GridHelper size 60, div 60 implies cell size 1.
            */}
		</group>
	);
}

function StarField({ reducedMotion }: { reducedMotion: boolean }) {
	const ref = useRef<ThreePoints>(null);
	// Generate stars in a large sphere
	const stars = useMemo(() => generateStarPoints(600, 25), []);
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame((state, delta) => {
		if (reducedMotion || !ref.current) return;
		// Slow rotation
		ref.current.rotation.y += delta * 0.02;
		ref.current.rotation.x += delta * 0.005;
	});

	return (
		<group rotation={[0, 0, Math.PI / 4]}>
			<Points ref={ref} positions={stars} stride={3} frustumCulled={false}>
				<PointMaterial
					transparent
					color={isDark ? '#fff' : '#000'}
					size={0.06} // slightly chunkier stars
					sizeAttenuation
					depthWrite={false}
					opacity={isDark ? 0.6 : 0.4}
				/>
			</Points>
		</group>
	);
}

function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
	useFrame(state => {
		if (reducedMotion) return;

		// Gentle mouse parallax
		const x = state.pointer.x * 0.5;
		const y = state.pointer.y * 0.3;

		state.camera.position.x += (x - state.camera.position.x) * 0.02;
		state.camera.position.y += (1 - y - state.camera.position.y) * 0.02; // Look slightly down by hovering up
		state.camera.lookAt(0, -2, 0); // Look at the grid floor
	});
	return null;
}

// --- Main ---

export function Background3D() {
	const [dpr] = useState(() => Math.min(window.devicePixelRatio || 1, 1.5));
	const reducedMotion = usePrefersReducedMotion();

	// WebGL availability check
	const [hasWebGLError, setHasWebGLError] = useState(false);
	useEffect(() => {
		try {
			const canvas = document.createElement('canvas');
			const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
			if (!gl) setHasWebGLError(true);
		} catch {
			setHasWebGLError(true);
		}
	}, []);

	if (hasWebGLError) return null;

	return (
		<div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ease-in-out">
			<ErrorBoundary>
				<Canvas
					dpr={dpr}
					frameloop={reducedMotion ? 'demand' : 'always'}
					// Camera pushed back and up
					camera={{ position: [0, 2, 6], fov: 60, near: 0.1, far: 50 }}
					gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
					onCreated={({ gl }) => gl.setClearAlpha(0)}
				>
					{/* Fog for depth fading */}
					{/* We can't easily adhere to theme inside Canvas for fog without context, 
                        but we can assume dark mode mostly or pass a prop if needed. 
                        Let's skip fog for now to keep it crisp as requested (grid + stars).
                    */}
					<CameraRig reducedMotion={reducedMotion} />
					<MovingGrid reducedMotion={reducedMotion} />
					<StarField reducedMotion={reducedMotion} />
				</Canvas>
			</ErrorBoundary>
		</div>
	);
}
