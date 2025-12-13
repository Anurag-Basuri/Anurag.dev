'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import type { JSX } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Trail } from '@react-three/drei';
import { useTheme } from 'next-themes';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { Points as ThreePoints, Mesh, Group } from 'three';
import * as THREE from 'three';

// Generate random positions in a sphere
function generateSpherePoints(count: number, radius: number) {
	const points = new Float32Array(count * 3);
	for (let i = 0; i < count; i++) {
		const u = Math.random();
		const v = Math.random();
		const theta = 2 * Math.PI * u;
		const phi = Math.acos(2 * v - 1);
		const r = Math.cbrt(Math.random()) * radius;
		const x = r * Math.sin(phi) * Math.cos(theta);
		const y = r * Math.sin(phi) * Math.sin(theta);
		const z = r * Math.cos(phi);
		points[i * 3] = x;
		points[i * 3 + 1] = y;
		points[i * 3 + 2] = z;
	}
	return points;
}

// Generate logarithmic spiral for realistic galaxy arms
function generateGalaxyPoints(count: number) {
	const points = new Float32Array(count * 3);
	const arms = 3;
	const armWidth = 0.5;

	for (let i = 0; i < count; i++) {
		// Logarithmic spiral formula
		const armIndex = i % arms;
		const randomOffset = Math.random() * armWidth;
		const distance = Math.pow(Math.random(), 2) * 2; // Bias towards center
		const angle = armIndex * ((Math.PI * 2) / arms) + distance * 3 + randomOffset;

		const x = Math.cos(angle) * distance;
		const y = (Math.random() - 0.5) * 0.2 * (2 - distance); // Thicker center
		const z = Math.sin(angle) * distance;

		points[i * 3] = x;
		points[i * 3 + 1] = y;
		points[i * 3 + 2] = z;
	}
	return points;
}

// Camera orbit controller
function CameraRig() {
	useFrame(state => {
		const time = state.clock.elapsedTime;
		// Gentle circular orbit
		state.camera.position.x = Math.sin(time / 20) * 0.5;
		state.camera.position.z = 1.5 + Math.cos(time / 20) * 0.5;
		state.camera.position.y = Math.sin(time / 40) * 0.2; // Slight vertical wave
		state.camera.lookAt(0, 0, 0);
	});
	return null;
}

// Distant background stars
function DistantStars(props: JSX.IntrinsicElements['group']) {
	const ref = useRef<ThreePoints>(null);
	const [sphere] = useState(() => generateSpherePoints(3000, 4));
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame((_, delta) => {
		if (ref.current) {
			ref.current.rotation.y -= delta / 50;
		}
	});

	return (
		<group rotation={[0, 0, 0]} {...props}>
			<Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
				<PointMaterial
					transparent
					color={isDark ? '#ffffff' : '#a5b4fc'}
					size={0.0015}
					sizeAttenuation={true}
					depthWrite={false}
					opacity={isDark ? 0.6 : 0.4}
				/>
			</Points>
		</group>
	);
}

// Main galaxy spiral stars
function GalaxyStars(props: JSX.IntrinsicElements['group']) {
	const ref = useRef<ThreePoints>(null);
	const [galaxy] = useState(() => generateGalaxyPoints(5000));
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame((_, delta) => {
		if (ref.current) {
			ref.current.rotation.y += delta / 25;
		}
	});

	return (
		<group rotation={[Math.PI / 8, 0, 0]} {...props}>
			<Points ref={ref} positions={galaxy} stride={3} frustumCulled={false}>
				<PointMaterial
					transparent
					color={isDark ? '#a78bfa' : '#6366f1'}
					size={0.004}
					sizeAttenuation={true}
					depthWrite={false}
					opacity={isDark ? 0.8 : 0.6}
					blending={THREE.AdditiveBlending}
				/>
			</Points>
		</group>
	);
}

// Shooting Star
function ShootingStar() {
	const ref = useRef<Mesh>(null);
	const [resetKey, setResetKey] = useState(0);

	useFrame(state => {
		if (ref.current) {
			ref.current.position.x -= 0.15;
			ref.current.position.y -= 0.05;

			// Reset when out of view
			if (ref.current.position.x < -4) {
				const startX = 3 + Math.random() * 2;
				const startY = 1 + Math.random();
				const startZ = -1 + Math.random() * 2;
				ref.current.position.set(startX, startY, startZ);
				setResetKey(prev => prev + 1); // Reset trail
			}
		}
	});

	return (
		<mesh ref={ref} position={[3, 2, 0]}>
			<sphereGeometry args={[0.02, 8, 8]} />
			<meshBasicMaterial color="#ffffff" transparent opacity={0} />
			<Trail
				key={resetKey}
				width={1}
				length={8}
				color={new THREE.Color('#4f46e5')}
				attenuation={t => t * t}
			>
				<mesh>
					<sphereGeometry args={[0.01, 8, 8]} />
					<meshBasicMaterial color="#ffffff" />
				</mesh>
			</Trail>
		</mesh>
	);
}

// Planet Component
function Planet({
	position,
	size,
	color,
	ring = false,
}: {
	position: [number, number, number];
	size: number;
	color: string;
	ring?: boolean;
}) {
	const ref = useRef<Mesh>(null);
	const ringRef = useRef<Mesh>(null);

	useFrame(state => {
		if (ref.current) {
			ref.current.rotation.y += 0.005;
		}
		if (ringRef.current) {
			ringRef.current.rotation.x = -Math.PI / 2;
			ringRef.current.rotation.z += 0.002;
		}
	});

	return (
		<group position={position}>
			<mesh ref={ref}>
				<sphereGeometry args={[size, 32, 32]} />
				<meshStandardMaterial color={color} roughness={0.7} />
			</mesh>
			{ring && (
				<mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
					<ringGeometry args={[size * 1.4, size * 1.8, 64]} />
					<meshBasicMaterial
						color={color}
						transparent
						opacity={0.4}
						side={THREE.DoubleSide}
					/>
				</mesh>
			)}
		</group>
	);
}

export function Background3D() {
	const [hasWebGLError, setHasWebGLError] = useState(false);
	const { theme } = useTheme();
	const isDark = useMemo(() => theme === 'dark', [theme]);

	useEffect(() => {
		try {
			const canvas = document.createElement('canvas');
			const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
			if (!gl) {
				Promise.resolve().then(() => setHasWebGLError(true));
			}
		} catch (e) {
			Promise.resolve().then(() => setHasWebGLError(true));
		}
	}, []);

	if (hasWebGLError) {
		return null;
	}

	return (
		<div className="absolute inset-0 z-0 pointer-events-none">
			<ErrorBoundary>
				<Canvas
					camera={{ position: [0, 0, 1], fov: 60 }}
					onCreated={({ gl }) => {
						if (!gl) {
							setHasWebGLError(true);
						}
					}}
				>
					<ambientLight intensity={0.5} />
					<pointLight position={[10, 10, 10]} intensity={1} />

					<CameraRig />
					<DistantStars />
					<GalaxyStars />

					{/* Cosmic Objects */}
					<Planet
						position={[1.8, 0.5, -2]}
						size={0.15}
						color={isDark ? '#8b5cf6' : '#a5b4fc'}
						ring
					/>
					<Planet
						position={[-2, -0.8, -1.5]}
						size={0.1}
						color={isDark ? '#2dd4bf' : '#99f6e4'}
					/>

					<ShootingStar />
				</Canvas>
			</ErrorBoundary>
		</div>
	);
}
