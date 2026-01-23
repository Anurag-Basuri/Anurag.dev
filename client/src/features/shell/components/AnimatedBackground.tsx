'use client';

import { memo, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useThemeColor } from '@/hooks/use-theme-colors';

function FloatingOrbs() {
	const groupRef = useRef<THREE.Group>(null);
	const primary = useThemeColor('--primary', '#6366f1');
	const muted = useThemeColor('--muted-foreground', '#94a3b8');

	const { viewport } = useThree();

	const orbs = useMemo(
		() => [
			{
				position: [-viewport.width * 0.25, 0.6, -1.5],
				scale: 1.1,
				speed: 0.4,
				color: primary,
			},
			{ position: [viewport.width * 0.3, -0.4, -2.2], scale: 1.4, speed: 0.3, color: muted },
			{ position: [0.1, -0.9, -1.8], scale: 0.9, speed: 0.5, color: primary },
		],
		[viewport.width, primary, muted],
	);

	useFrame(({ clock }) => {
		if (!groupRef.current) return;
		const t = clock.getElapsedTime();
		groupRef.current.rotation.y = t * 0.03;
		groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.05;
	});

	return (
		<group ref={groupRef}>
			{orbs.map((orb, idx) => (
				<mesh
					key={idx}
					position={[
						orb.position[0],
						orb.position[1] + Math.sin(idx + performance.now() * 0.0002) * 0.15,
						orb.position[2],
					]}
					scale={orb.scale}
				>
					<sphereGeometry args={[1, 48, 48]} />
					<meshStandardMaterial
						color={orb.color}
						emissive={orb.color}
						emissiveIntensity={0.35}
						transparent
						opacity={0.18}
						roughness={0.6}
						metalness={0.2}
					/>
				</mesh>
			))}
		</group>
	);
}

function Scene() {
	return (
		<>
			<ambientLight intensity={0.4} />
			<pointLight position={[4, 3, 6]} intensity={0.6} color="#7aa2ff" />
			<pointLight position={[-3, -2, 4]} intensity={0.4} color="#22d3ee" />
			<FloatingOrbs />
			<Stars radius={80} depth={50} count={800} factor={3} saturation={0} fade speed={0.4} />
		</>
	);
}

export const AnimatedBackground = memo(function AnimatedBackground() {
	return (
		<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
			<Canvas
				className="absolute inset-0"
				dpr={[1, 1.5]}
				gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
				camera={{ position: [0, 0, 7], fov: 60 }}
			>
				<Scene />
			</Canvas>

			{/* Overlay for readability */}
			<div className="absolute inset-0 bg-linear-to-br from-background/70 via-background/60 to-muted/20" />

			{/* Subtle grid on desktop */}
			<div
				className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] hidden md:block"
				style={{
					backgroundImage:
						'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
					backgroundSize: '48px 48px',
				}}
			/>

			{/* Noise texture */}
			<div className="absolute inset-0 opacity-[0.02] bg-noise" />
		</div>
	);
});
