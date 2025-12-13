'use client';

import React, { useRef, useState, useEffect } from 'react';
import type { JSX } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { useTheme } from 'next-themes';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { Points as ThreePoints, Mesh } from 'three';
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

// Generate galaxy spiral arm points
function generateGalaxyPoints(count: number) {
	const points = new Float32Array(count * 3);
	for (let i = 0; i < count; i++) {
		const angle = Math.random() * Math.PI * 4; // Multiple rotations
		const radius = Math.random() * 2;
		const spiralOffset = angle * 0.3; // Spiral tightness
		const x = Math.cos(angle + spiralOffset) * radius + (Math.random() - 0.5) * 0.5;
		const y = (Math.random() - 0.5) * 0.3; // Flat disk
		const z = Math.sin(angle + spiralOffset) * radius + (Math.random() - 0.5) * 0.5;
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
		state.camera.position.x = Math.sin(time / 10) * 0.3;
		state.camera.position.z = 1 + Math.cos(time / 10) * 0.3;
		state.camera.lookAt(0, 0, 0);
	});
	return null;
}

// Distant background stars
function DistantStars(props: JSX.IntrinsicElements['group']) {
	const ref = useRef<ThreePoints>(null);
	const [sphere] = useState(() => generateSpherePoints(3000, 3));
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame((_, delta) => {
		if (ref.current) {
			ref.current.rotation.x -= delta / 30;
			ref.current.rotation.y -= delta / 40;
		}
	});

	return (
		<group rotation={[0, 0, 0]} {...props}>
			<Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
				<PointMaterial
					transparent
					color={isDark ? '#ffffff' : '#a5b4fc'}
					size={0.001}
					sizeAttenuation={true}
					depthWrite={false}
					opacity={isDark ? 0.4 : 0.3}
				/>
			</Points>
		</group>
	);
}

// Main galaxy spiral stars
function GalaxyStars(props: JSX.IntrinsicElements['group']) {
	const ref = useRef<ThreePoints>(null);
	const [galaxy] = useState(() => generateGalaxyPoints(4000));
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame((_, delta) => {
		if (ref.current) {
			ref.current.rotation.y += delta / 20;
		}
	});

	return (
		<group rotation={[Math.PI / 6, 0, 0]} {...props}>
			<Points ref={ref} positions={galaxy} stride={3} frustumCulled={false}>
				<PointMaterial
					transparent
					color={isDark ? '#a78bfa' : '#6366f1'}
					size={0.003}
					sizeAttenuation={true}
					depthWrite={false}
					opacity={isDark ? 0.6 : 0.4}
				/>
			</Points>
		</group>
	);
}

// Nebula particles (larger, colorful, glowing)
function NebulaParticles(props: JSX.IntrinsicElements['group']) {
	const ref = useRef<ThreePoints>(null);
	const [nebula] = useState(() => generateSpherePoints(800, 2));
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame(state => {
		if (ref.current) {
			ref.current.rotation.x = state.clock.elapsedTime / 30;
			ref.current.rotation.y = state.clock.elapsedTime / 25;
		}
	});

	return (
		<group {...props}>
			<Points ref={ref} positions={nebula} stride={3} frustumCulled={false}>
				<PointMaterial
					transparent
					color={isDark ? '#ec4899' : '#d946ef'}
					size={0.015}
					sizeAttenuation={true}
					depthWrite={false}
					opacity={isDark ? 0.15 : 0.1}
					blending={THREE.AdditiveBlending}
				/>
			</Points>
		</group>
	);
}

// Twinkling foreground stars
function TwinklingStars(props: JSX.IntrinsicElements['group']) {
	const ref = useRef<ThreePoints>(null);
	const [stars] = useState(() => generateSpherePoints(1500, 2.5));
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame(state => {
		if (ref.current) {
			const material = ref.current.material as THREE.PointsMaterial;
			material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
			ref.current.rotation.y += 0.0001;
		}
	});

	return (
		<group {...props}>
			<Points ref={ref} positions={stars} stride={3} frustumCulled={false}>
				<PointMaterial
					transparent
					color={isDark ? '#22d3ee' : '#3b82f6'}
					size={0.002}
					sizeAttenuation={true}
					depthWrite={false}
					opacity={0.5}
				/>
			</Points>
		</group>
	);
}

// Floating geometric ring
function FloatingRing() {
	const ref = useRef<Mesh>(null);
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame(state => {
		if (ref.current) {
			ref.current.rotation.x = state.clock.elapsedTime / 3;
			ref.current.rotation.y = state.clock.elapsedTime / 2;
			ref.current.position.y = Math.sin(state.clock.elapsedTime / 2) * 0.2;
		}
	});

	return (
		<mesh ref={ref} position={[1.5, 0, -2]}>
			<torusGeometry args={[0.3, 0.02, 16, 100]} />
			<meshBasicMaterial
				color={isDark ? '#8b5cf6' : '#6366f1'}
				transparent
				opacity={0.3}
				wireframe
			/>
		</mesh>
	);
}

// Crystal shape (octahedron)
function FloatingCrystal() {
	const ref = useRef<Mesh>(null);
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame(state => {
		if (ref.current) {
			ref.current.rotation.x = state.clock.elapsedTime / 4;
			ref.current.rotation.y = state.clock.elapsedTime / 3;
			ref.current.position.y = Math.cos(state.clock.elapsedTime / 3) * 0.15;
		}
	});

	return (
		<mesh ref={ref} position={[-1.8, 0.3, -2.5]}>
			<octahedronGeometry args={[0.15, 0]} />
			<meshBasicMaterial
				color={isDark ? '#14b8a6' : '#06b6d4'}
				transparent
				opacity={0.4}
				wireframe
			/>
		</mesh>
	);
}

// Glowing orbs
function GlowingOrb({ position }: { position: [number, number, number] }) {
	const ref = useRef<Mesh>(null);
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame(state => {
		if (ref.current) {
			const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2;
			ref.current.scale.set(scale, scale, scale);
		}
	});

	return (
		<mesh ref={ref} position={position}>
			<sphereGeometry args={[0.08, 16, 16]} />
			<meshBasicMaterial color={isDark ? '#f472b6' : '#ec4899'} transparent opacity={0.6} />
		</mesh>
	);
}

// Distant rotating icosahedron
function DistantIcosahedron() {
	const ref = useRef<Mesh>(null);
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame(state => {
		if (ref.current) {
			ref.current.rotation.x = state.clock.elapsedTime / 6;
			ref.current.rotation.z = state.clock.elapsedTime / 8;
		}
	});

	return (
		<mesh ref={ref} position={[0, -1, -3]}>
			<icosahedronGeometry args={[0.4, 0]} />
			<meshBasicMaterial
				color={isDark ? '#a78bfa' : '#8b5cf6'}
				transparent
				opacity={0.15}
				wireframe
			/>
		</mesh>
	);
}

export function Background3D() {
	const [hasWebGLError, setHasWebGLError] = useState(false);

	// Check if WebGL is available
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

	// If WebGL is not available, render nothing
	if (hasWebGLError) {
		return null;
	}

	return (
		<div className="absolute inset-0 z-0 pointer-events-none">
			<ErrorBoundary>
				<Canvas
					camera={{ position: [0, 0, 1], fov: 75 }}
					onCreated={({ gl }) => {
						if (!gl) {
							setHasWebGLError(true);
						}
					}}
				>
					<CameraRig />
					<DistantStars />
					<GalaxyStars />
					<NebulaParticles />
					<TwinklingStars />
					<FloatingRing />
					<FloatingCrystal />
					<DistantIcosahedron />
					<GlowingOrb position={[0.8, 0.5, -1.5]} />
					<GlowingOrb position={[-0.6, -0.3, -1.8]} />
					<GlowingOrb position={[0.2, 0.8, -2.2]} />
				</Canvas>
			</ErrorBoundary>
		</div>
	);
}
