'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import type { Points } from 'three';
import { useThemeName } from '../colors/theme-context';
import { THEMES } from '../colors/tokens';

function StarfieldPoints({ count = 2200 }: { count?: number }) {
	const ref = useRef<Points>(null!);
	const themeName = useThemeName();
	const color = THEMES[themeName].secondary;

	const { positions, speeds } = useMemo(() => {
		const positions = new Float32Array(count * 3);
		const speeds = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			const i3 = i * 3;
			positions[i3 + 0] = (Math.random() - 0.5) * 80; // x
			positions[i3 + 1] = (Math.random() - 0.5) * 50; // y
			positions[i3 + 2] = -Math.random() * 120; // z (in front of camera is negative)
			speeds[i] = 8 + Math.random() * 22;
		}

		return { positions, speeds };
	}, [count]);

	useFrame((_, delta) => {
		const geom = ref.current.geometry as THREE.BufferGeometry;
		const attr = geom.attributes.position as THREE.BufferAttribute;

		for (let i = 0; i < count; i++) {
			const i3 = i * 3;
			let z = attr.array[i3 + 2] as number;
			z += speeds[i]! * delta;

			if (z > 6) {
				attr.array[i3 + 0] = (Math.random() - 0.5) * 80;
				attr.array[i3 + 1] = (Math.random() - 0.5) * 50;
				z = -120;
			}

			attr.array[i3 + 2] = z;
		}

		attr.needsUpdate = true;
		ref.current.rotation.z += delta * 0.01;
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
				size={0.06}
				color={color}
				transparent
				opacity={0.55}
				depthWrite={false}
				sizeAttenuation
			/>
		</points>
	);
}

export function StarfieldWarp() {
	const [mounted, setMounted] = useState(false);
	const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);
	const themeName = useThemeName();
	const fogColor = THEMES[themeName].bg;

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
				camera={{ position: [0, 0, 6], fov: 65 }}
				gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
				style={{ background: 'transparent' }}
			>
				<PerformanceMonitor onDecline={() => setDpr([1, 1])} onIncline={() => setDpr([1, 1.5])} />
				<fog attach="fog" args={[fogColor, 10, 120]} />
				<StarfieldPoints />
			</Canvas>
		</div>
	);
}

