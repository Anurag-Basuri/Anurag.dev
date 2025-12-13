'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import type { JSX } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { useTheme } from 'next-themes';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { Points as ThreePoints } from 'three';
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
					camera={{ position: [0, 0, 1] }}
					onCreated={({ gl }) => {
						if (!gl) {
							setHasWebGLError(true);
						}
					}}
				>
					<CyberMatrix />
					<DistantStars />
					<GalaxyStars />
					<NebulaParticles />
					<TwinklingStars />
				</Canvas>
			</ErrorBoundary>
		</div>
	);
}

// Advanced Cyber-tech visual system
function CyberMatrix(props: JSX.IntrinsicElements['group']) {
	const groupRef = useRef<THREE.Group>(null);
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	// Animation refs for independent movements
	const ring1Ref = useRef<THREE.Mesh>(null);
	const ring2Ref = useRef<THREE.Mesh>(null);
	const ring3Ref = useRef<THREE.Mesh>(null);
	const coreRef = useRef<THREE.Mesh>(null);
	const satellitesRef = useRef<THREE.Group>(null);

	// Theme colors
	const primary = isDark ? '#10b981' : '#64748b'; // Emerald/Slate
	const secondary = isDark ? '#3b82f6' : '#94a3b8'; // Blue/Slate-light
	const accent = isDark ? '#8b5cf6' : '#a78bfa'; // Purple

	useFrame(state => {
		const t = state.clock.elapsedTime;

		if (groupRef.current) {
			// Gentle floating of entire system
			groupRef.current.position.y = Math.sin(t * 0.2) * 0.1;
			groupRef.current.rotation.z = t * 0.05;
		}

		// Independent ring rotations (Gyroscopic effect)
		if (ring1Ref.current) {
			ring1Ref.current.rotation.x = t * 0.2;
			ring1Ref.current.rotation.y = t * 0.1;
		}
		if (ring2Ref.current) {
			ring2Ref.current.rotation.x = t * -0.15;
			ring2Ref.current.rotation.z = t * 0.2;
		}
		if (ring3Ref.current) {
			ring3Ref.current.rotation.y = t * 0.25;
			ring3Ref.current.rotation.x = t * 0.1;
		}

		// Core pulsing
		if (coreRef.current) {
			const scale = 1 + Math.sin(t * 2) * 0.1;
			coreRef.current.scale.set(scale, scale, scale);
			coreRef.current.rotation.y -= 0.02;
			coreRef.current.rotation.z -= 0.02;
		}

		// Satellites orbiting
		if (satellitesRef.current) {
			satellitesRef.current.rotation.y = t * 0.3;
			satellitesRef.current.rotation.z = t * 0.1;
		}
	});

	return (
		<group ref={groupRef} {...props}>
			{/* Ring 1: Large Outer Structure */}
			<mesh ref={ring1Ref}>
				<torusGeometry args={[2.2, 0.02, 16, 100]} />
				<meshBasicMaterial
					color={secondary}
					transparent
					opacity={isDark ? 0.15 : 0.05}
					wireframe
				/>
			</mesh>

			{/* Ring 2: Mid-level Data Ring */}
			<mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
				<torusGeometry args={[1.8, 0.05, 16, 6]} /> {/* Low segments for hexagonal feel */}
				<meshBasicMaterial
					color={primary}
					transparent
					opacity={isDark ? 0.2 : 0.08}
					wireframe
				/>
			</mesh>

			{/* Ring 3: Fast Inner Ring */}
			<mesh ref={ring3Ref} rotation={[0, Math.PI / 4, 0]}>
				<torusGeometry args={[1.4, 0.03, 16, 50]} />
				<meshBasicMaterial
					color={accent}
					transparent
					opacity={isDark ? 0.25 : 0.1}
					wireframe
				/>
			</mesh>

			{/* Central Core: Complex Geodesic */}
			<mesh ref={coreRef}>
				<octahedronGeometry args={[0.8, 0]} />
				<meshBasicMaterial
					color={primary}
					wireframe
					transparent
					opacity={isDark ? 0.4 : 0.2}
				/>
			</mesh>

			{/* Solid Inner Core for Glow */}
			<mesh scale={[0.4, 0.4, 0.4]}>
				<dodecahedronGeometry args={[1, 0]} />
				<meshBasicMaterial color={accent} transparent opacity={isDark ? 0.6 : 0.3} />
			</mesh>

			{/* Orbiting Satellite Nodes */}
			<group ref={satellitesRef}>
				{[...Array(4)].map((_, i) => (
					<mesh key={i} position={[2.8, 0, 0]} rotation={[0, (i * Math.PI) / 2, 0]}>
						<sphereGeometry args={[0.08, 8, 8]} />
						<meshBasicMaterial color={secondary} transparent opacity={0.6} />
					</mesh>
				))}
				{/* Cross-orbit satellites */}
				<group rotation={[Math.PI / 2, 0, 0]}>
					{[...Array(3)].map((_, i) => (
						<mesh
							key={i}
							position={[2.2, 0, 0]}
							rotation={[0, (i * Math.PI * 2) / 3, 0]}
						>
							<boxGeometry args={[0.1, 0.1, 0.1]} />
							<meshBasicMaterial color={primary} transparent opacity={0.7} />
						</mesh>
					))}
				</group>
			</group>
		</group>
	);
}
