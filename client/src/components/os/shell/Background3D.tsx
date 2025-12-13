'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { useTheme } from 'next-themes';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { Points as ThreePoints } from 'three';
import * as THREE from 'three';

type Pointer = { x: number; y: number };

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

function useWindowPointer() {
	const pointerRef = useRef<Pointer>({ x: 0, y: 0 });

	useEffect(() => {
		const updateFromEvent = (clientX: number, clientY: number) => {
			const w = window.innerWidth || 1;
			const h = window.innerHeight || 1;

			// Normalize to [-1, 1]
			const x = (clientX / w) * 2 - 1;
			const y = -((clientY / h) * 2 - 1);

			pointerRef.current.x = THREE.MathUtils.clamp(x, -1, 1);
			pointerRef.current.y = THREE.MathUtils.clamp(y, -1, 1);
		};

		const onPointerMove = (e: PointerEvent) => updateFromEvent(e.clientX, e.clientY);
		const onTouchMove = (e: TouchEvent) => {
			const t = e.touches?.[0];
			if (t) updateFromEvent(t.clientX, t.clientY);
		};

		window.addEventListener('pointermove', onPointerMove, { passive: true });
		window.addEventListener('touchmove', onTouchMove, { passive: true });

		return () => {
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('touchmove', onTouchMove);
		};
	}, []);

	return pointerRef;
}

// Generate random positions in a sphere
function generateSpherePoints(count: number, radius: number) {
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

// Generate galaxy spiral arm points
function generateGalaxyPoints(count: number) {
	const points = new Float32Array(count * 3);
	for (let i = 0; i < count; i++) {
		const angle = Math.random() * Math.PI * 4;
		const radius = Math.random() * 2;
		const spiralOffset = angle * 0.3;

		points[i * 3] = Math.cos(angle + spiralOffset) * radius + (Math.random() - 0.5) * 0.5;
		points[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
		points[i * 3 + 2] = Math.sin(angle + spiralOffset) * radius + (Math.random() - 0.5) * 0.5;
	}
	return points;
}

function CameraRig({
	pointerRef,
	reducedMotion,
}: {
	pointerRef: React.MutableRefObject<Pointer>;
	reducedMotion: boolean;
}) {
	const base = useMemo(() => new THREE.Vector3(0, 0, 5.5), []);

	useFrame((state, delta) => {
		if (reducedMotion) return;

		// Exponential smoothing that feels consistent across FPS
		const t = 1 - Math.pow(0.001, delta);

		const px = pointerRef.current.x;
		const py = pointerRef.current.y;

		// Mild parallax: "viewer perspective" improvement without being distracting
		const targetX = base.x + px * 0.45;
		const targetY = base.y + py * 0.25;

		// Tiny drift so it doesn’t feel static if the user isn’t moving the mouse
		const driftX = Math.sin(state.clock.elapsedTime * 0.12) * 0.08;
		const driftY = Math.cos(state.clock.elapsedTime * 0.1) * 0.06;

		state.camera.position.x = THREE.MathUtils.lerp(
			state.camera.position.x,
			targetX + driftX,
			t,
		);
		state.camera.position.y = THREE.MathUtils.lerp(
			state.camera.position.y,
			targetY + driftY,
			t,
		);
		state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, base.z, t);

		state.camera.lookAt(0, 0, 0);
	});

	return null;
}

// Distant background stars
function DistantStars({
	reducedMotion,
	...props
}: JSX.IntrinsicElements['group'] & { reducedMotion: boolean }) {
	const ref = useRef<ThreePoints>(null);
	const sphere = useMemo(() => generateSpherePoints(2600, 3.2), []);
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame((_, delta) => {
		if (reducedMotion) return;
		if (ref.current) {
			ref.current.rotation.x -= delta * 0.03;
			ref.current.rotation.y -= delta * 0.02;
		}
	});

	return (
		<group position={[0, 0, -2.0]} {...props}>
			<Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
				<PointMaterial
					transparent
					color={isDark ? '#ffffff' : '#a5b4fc'}
					size={0.0012}
					sizeAttenuation
					depthWrite={false}
					opacity={isDark ? 0.35 : 0.25}
				/>
			</Points>
		</group>
	);
}

// Main galaxy spiral stars
function GalaxyStars({
	reducedMotion,
	...props
}: JSX.IntrinsicElements['group'] & { reducedMotion: boolean }) {
	const ref = useRef<ThreePoints>(null);
	const galaxy = useMemo(() => generateGalaxyPoints(3800), []);
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame((_, delta) => {
		if (reducedMotion) return;
		if (ref.current) {
			ref.current.rotation.y += delta * 0.06;
		}
	});

	return (
		<group rotation={[Math.PI / 7, 0, 0]} position={[0, 0, -0.8]} {...props}>
			<Points ref={ref} positions={galaxy} stride={3} frustumCulled={false}>
				<PointMaterial
					transparent
					color={isDark ? '#a78bfa' : '#6366f1'}
					size={0.0035}
					sizeAttenuation
					depthWrite={false}
					opacity={isDark ? 0.55 : 0.35}
				/>
			</Points>
		</group>
	);
}

// Nebula particles (larger, colorful, glowing)
function NebulaParticles({
	reducedMotion,
	...props
}: JSX.IntrinsicElements['group'] & { reducedMotion: boolean }) {
	const ref = useRef<ThreePoints>(null);
	const nebula = useMemo(() => generateSpherePoints(650, 2.2), []);
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame(state => {
		if (reducedMotion) return;
		if (ref.current) {
			ref.current.rotation.x = state.clock.elapsedTime / 30;
			ref.current.rotation.y = state.clock.elapsedTime / 25;
		}
	});

	return (
		<group position={[0.15, -0.05, -0.4]} {...props}>
			<Points ref={ref} positions={nebula} stride={3} frustumCulled={false}>
				<PointMaterial
					transparent
					color={isDark ? '#ec4899' : '#d946ef'}
					size={0.016}
					sizeAttenuation
					depthWrite={false}
					opacity={isDark ? 0.14 : 0.09}
					blending={THREE.AdditiveBlending}
				/>
			</Points>
		</group>
	);
}

// Twinkling foreground stars
function TwinklingStars({
	reducedMotion,
	...props
}: JSX.IntrinsicElements['group'] & { reducedMotion: boolean }) {
	const pointsRef = useRef<ThreePoints>(null);
	const materialRef = useRef<import('@react-three/drei').PointMaterialImpl | null>(null);
	const stars = useMemo(() => generateSpherePoints(1300, 2.8), []);
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame(state => {
		if (reducedMotion) return;

		const baseOpacity = isDark ? 0.45 : 0.35;
		const twinkle = 0.12 * Math.sin(state.clock.elapsedTime * 2.0);
		const nextOpacity = THREE.MathUtils.clamp(baseOpacity + twinkle, 0.15, 0.65);

		if (materialRef.current) {
			// drei's PointMaterial is a ShaderMaterial with an opacity field
			(materialRef.current as unknown as { opacity: number }).opacity = nextOpacity;
		}

		if (pointsRef.current) {
			pointsRef.current.rotation.y += 0.002;
		}
	});

	return (
		<group position={[0, 0, 0.55]} {...props}>
			<Points ref={pointsRef} positions={stars} stride={3} frustumCulled={false}>
				<PointMaterial
					ref={materialRef}
					transparent
					color={isDark ? '#22d3ee' : '#3b82f6'}
					size={0.0024}
					sizeAttenuation
					depthWrite={false}
					opacity={isDark ? 0.45 : 0.35}
				/>
			</Points>
		</group>
	);
}

export function Background3D() {
	const [hasWebGLError, setHasWebGLError] = useState(false);
	const [dpr] = useState(() => Math.min(window.devicePixelRatio || 1, 1.5));

	const reducedMotion = usePrefersReducedMotion();
	const pointerRef = useWindowPointer();

	useEffect(() => {
		try {
			const canvas = document.createElement('canvas');
			const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
			if (!gl) Promise.resolve().then(() => setHasWebGLError(true));
		} catch {
			Promise.resolve().then(() => setHasWebGLError(true));
		}
	}, []);

	if (hasWebGLError) return null;

	return (
		<div className="absolute inset-0 z-0 pointer-events-none">
			<ErrorBoundary>
				<Canvas
					dpr={dpr}
					frameloop={reducedMotion ? 'demand' : 'always'}
					camera={{ position: [0, 0, 5.5], fov: 50, near: 0.1, far: 50 }}
					gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
					onCreated={({ gl }) => {
						// Keep the rest of the UI visible through the canvas.
						gl.setClearAlpha(0);
					}}
				>
					<CameraRig pointerRef={pointerRef} reducedMotion={reducedMotion} />

					<CyberMatrix reducedMotion={reducedMotion} scale={0.9} />
					<DistantStars reducedMotion={reducedMotion} />
					<GalaxyStars reducedMotion={reducedMotion} />
					<NebulaParticles reducedMotion={reducedMotion} />
					<TwinklingStars reducedMotion={reducedMotion} />
				</Canvas>
			</ErrorBoundary>
		</div>
	);
}

// Advanced Cyber-tech visual system
function CyberMatrix({
	reducedMotion,
	...props
}: JSX.IntrinsicElements['group'] & { reducedMotion: boolean }) {
	const groupRef = useRef<THREE.Group>(null);
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	const ring1Ref = useRef<THREE.Mesh>(null);
	const ring2Ref = useRef<THREE.Mesh>(null);
	const ring3Ref = useRef<THREE.Mesh>(null);
	const coreRef = useRef<THREE.Mesh>(null);
	const satellitesRef = useRef<THREE.Group>(null);

	const primary = isDark ? '#10b981' : '#64748b';
	const secondary = isDark ? '#3b82f6' : '#94a3b8';
	const accent = isDark ? '#8b5cf6' : '#a78bfa';

	useFrame(state => {
		if (reducedMotion) return;

		const t = state.clock.elapsedTime;

		if (groupRef.current) {
			groupRef.current.position.y = Math.sin(t * 0.2) * 0.08;
			groupRef.current.rotation.z = t * 0.05;
			groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.06;
		}

		if (ring1Ref.current) {
			ring1Ref.current.rotation.x = t * 0.18;
			ring1Ref.current.rotation.y = t * 0.12;
		}
		if (ring2Ref.current) {
			ring2Ref.current.rotation.x = t * -0.16;
			ring2Ref.current.rotation.z = t * 0.2;
		}
		if (ring3Ref.current) {
			ring3Ref.current.rotation.y = t * 0.24;
			ring3Ref.current.rotation.x = t * 0.1;
		}

		if (coreRef.current) {
			const scale = 1 + Math.sin(t * 2) * 0.08;
			coreRef.current.scale.set(scale, scale, scale);
			coreRef.current.rotation.y -= 0.02;
			coreRef.current.rotation.z -= 0.02;
		}

		if (satellitesRef.current) {
			satellitesRef.current.rotation.y = t * 0.3;
			satellitesRef.current.rotation.z = t * 0.1;
		}
	});

	const satellites = useMemo(() => Array.from({ length: 4 }, (_, i) => i), []);
	const crossSatellites = useMemo(() => Array.from({ length: 3 }, (_, i) => i), []);

	return (
		<group ref={groupRef} position={[0, 0, 0]} {...props}>
			<mesh ref={ring1Ref}>
				<torusGeometry args={[2.2, 0.02, 16, 100]} />
				<meshBasicMaterial
					color={secondary}
					transparent
					opacity={isDark ? 0.14 : 0.05}
					wireframe
				/>
			</mesh>

			<mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
				<torusGeometry args={[1.8, 0.05, 16, 6]} />
				<meshBasicMaterial
					color={primary}
					transparent
					opacity={isDark ? 0.18 : 0.08}
					wireframe
				/>
			</mesh>

			<mesh ref={ring3Ref} rotation={[0, Math.PI / 4, 0]}>
				<torusGeometry args={[1.4, 0.03, 16, 50]} />
				<meshBasicMaterial
					color={accent}
					transparent
					opacity={isDark ? 0.22 : 0.1}
					wireframe
				/>
			</mesh>

			<mesh ref={coreRef}>
				<octahedronGeometry args={[0.8, 0]} />
				<meshBasicMaterial
					color={primary}
					wireframe
					transparent
					opacity={isDark ? 0.35 : 0.18}
				/>
			</mesh>

			<mesh scale={[0.4, 0.4, 0.4]}>
				<dodecahedronGeometry args={[1, 0]} />
				<meshBasicMaterial color={accent} transparent opacity={isDark ? 0.55 : 0.28} />
			</mesh>

			<group ref={satellitesRef}>
				{satellites.map(i => {
					const a = (i / satellites.length) * Math.PI * 2;
					const r = 2.8;
					const x = Math.cos(a) * r;
					const z = Math.sin(a) * r;

					return (
						<mesh key={i} position={[x, 0, z]}>
							<sphereGeometry args={[0.08, 8, 8]} />
							<meshBasicMaterial color={secondary} transparent opacity={0.6} />
						</mesh>
					);
				})}

				<group rotation={[Math.PI / 2, 0, 0]}>
					{crossSatellites.map(i => {
						const a = (i / crossSatellites.length) * Math.PI * 2;
						const r = 2.2;
						const x = Math.cos(a) * r;
						const z = Math.sin(a) * r;

						return (
							<mesh key={i} position={[x, 0, z]}>
								<boxGeometry args={[0.1, 0.1, 0.1]} />
								<meshBasicMaterial color={primary} transparent opacity={0.7} />
							</mesh>
						);
					})}
				</group>
			</group>
		</group>
	);
}
