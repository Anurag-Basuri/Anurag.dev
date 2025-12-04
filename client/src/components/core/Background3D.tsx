'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { useTheme } from 'next-themes';

// Simple random sphere generator to avoid external dependency
function generateSpherePoints(count: number, radius: number) {
	const points = new Float32Array(count * 3);
	for (let i = 0; i < count; i++) {
		const u = Math.random();
		const v = Math.random();
		const theta = 2 * Math.PI * u;
		const phi = Math.acos(2 * v - 1);
		const r = Math.cbrt(Math.random()) * radius; // Cubic root for uniform distribution
		const x = r * Math.sin(phi) * Math.cos(theta);
		const y = r * Math.sin(phi) * Math.sin(theta);
		const z = r * Math.cos(phi);
		points[i * 3] = x;
		points[i * 3 + 1] = y;
		points[i * 3 + 2] = z;
	}
	return points;
}

function Stars(props: any) {
	const ref = useRef<any>(null);
	const [sphere] = useState(() => generateSpherePoints(5000, 1.5));

	useFrame((state, delta) => {
		if (ref.current) {
			ref.current.rotation.x -= delta / 10;
			ref.current.rotation.y -= delta / 15;
		}
	});

	const { theme } = useTheme();
	const isDark = theme === 'dark';

	return (
		<group rotation={[0, 0, Math.PI / 4]}>
			<Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
				<PointMaterial
					transparent
					color={isDark ? '#00ffcc' : '#4f46e5'}
					size={0.002}
					sizeAttenuation={true}
					depthWrite={false}
					opacity={isDark ? 0.8 : 0.6}
				/>
			</Points>
		</group>
	);
}

function Grid() {
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	return (
		<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
			<planeGeometry args={[50, 50, 50, 50]} />
			<meshBasicMaterial
				color={isDark ? '#00ffcc' : '#4f46e5'}
				wireframe
				transparent
				opacity={isDark ? 0.05 : 0.03}
			/>
		</mesh>
	);
}

export default function Background3D() {
	return (
		<div className="absolute inset-0 z-0 pointer-events-none">
			<Canvas camera={{ position: [0, 0, 1] }}>
				<Stars />
				<Grid />
			</Canvas>
		</div>
	);
}
