'use client';

import { useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { useThemeName } from '../colors/theme-context';
import { THEMES } from '../colors/tokens';

function GridScene() {
	const themeName = useThemeName();
	const primary = THEMES[themeName].primary;
	const secondary = THEMES[themeName].secondary;

	const gridColor1 = useMemo(() => new THREE.Color(primary), [primary]);
	const gridColor2 = useMemo(() => new THREE.Color(secondary), [secondary]);

	const group = useMemo(() => new THREE.Group(), []);

	useFrame((state, delta) => {
		group.rotation.x = -Math.PI / 2.3;
		group.rotation.z += delta * 0.02;
		group.position.y = -6.5 + Math.sin(state.clock.elapsedTime * 0.35) * 0.15;
	});

	return (
		<primitive object={group}>
			<gridHelper args={[80, 48, gridColor1, gridColor2]} />
			<gridHelper args={[80, 24, gridColor2, gridColor1]} />

			{/* Soft glow plane */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
				<planeGeometry args={[90, 90, 1, 1]} />
				<meshBasicMaterial
					color={primary}
					transparent
					opacity={0.03}
					depthWrite={false}
				/>
			</mesh>

			{/* Floating ring */}
			<mesh position={[0, 2.2, -14]} rotation={[Math.PI / 2, 0, 0]}>
				<ringGeometry args={[3.5, 4.2, 64]} />
				<meshBasicMaterial color={secondary} transparent opacity={0.08} depthWrite={false} />
			</mesh>
		</primitive>
	);
}

export function TechGrid() {
	const [mounted, setMounted] = useState(false);
	const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);

	useEffect(() => setMounted(true), []);
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
				camera={{ position: [0, 7, 14], fov: 60 }}
				gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
				style={{ background: 'transparent' }}
			>
				<PerformanceMonitor onDecline={() => setDpr([1, 1])} onIncline={() => setDpr([1, 1.5])} />
				<ambientLight intensity={0.1} />
				<pointLight position={[8, 10, 6]} intensity={0.25} />
				<GridScene />
			</Canvas>
		</div>
	);
}

