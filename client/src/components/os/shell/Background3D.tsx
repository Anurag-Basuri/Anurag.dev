'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points as DreiPoints, PointMaterial, Trail } from '@react-three/drei';
import { useTheme } from 'next-themes';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { Mesh, Points as ThreePoints } from 'three';
import * as THREE from 'three';

function randn() {
	let u = 0;
	let v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Generate random positions in a sphere (background stars)
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

type GalaxyLayerParams = {
	count: number;
	arms: number;
	radius: number;
	coreRadius: number;
	twist: number; // controls how tightly arms wind
	armSpread: number; // gaussian spread around arms
	thickness: number; // y thickness
	jitter: number; // random positional jitter
};

function buildGalaxyGeometry(params: GalaxyLayerParams, isDark: boolean) {
	const positions = new Float32Array(params.count * 3);
	const colors = new Float32Array(params.count * 3);

	const warmCore = new THREE.Color(isDark ? '#fff7ed' : '#312e81');
	const midBlue = new THREE.Color(isDark ? '#93c5fd' : '#4f46e5');
	const outerPurple = new THREE.Color(isDark ? '#a78bfa' : '#6366f1');

	const tmpColorA = new THREE.Color();
	const tmpColorB = new THREE.Color();
	const tmpColor = new THREE.Color();

	for (let i = 0; i < params.count; i++) {
		// Bias towards center but keep arms populated
		const r01 = Math.pow(Math.random(), 0.55);
		const r = r01 * params.radius;

		const arm = i % params.arms;
		const armAngle = (arm / params.arms) * Math.PI * 2;

		// Spiral: angle grows with radius (log-ish feel)
		const spiral = r * params.twist;

		// Spread around arm centerline (gaussian looks more natural)
		const spread = randn() * params.armSpread * (0.35 + 0.65 * (r / params.radius));
		const angle = armAngle + spiral + spread;

		const jitter = params.jitter * (0.4 + 0.6 * (1 - r01));
		const x = Math.cos(angle) * r + randn() * jitter;
		const z = Math.sin(angle) * r + randn() * jitter;

		// Thicker core, thinner outer disc
		const thickness = params.thickness * (0.25 + 0.75 * (1 - r01));
		const y = randn() * thickness;

		positions[i * 3] = x;
		positions[i * 3 + 1] = y;
		positions[i * 3 + 2] = z;

		// Color gradient: warm core -> blue -> purple outer
		const coreT = THREE.MathUtils.clamp(r / params.coreRadius, 0, 1);
		const outerT = THREE.MathUtils.clamp(
			(r - params.coreRadius) / (params.radius - params.coreRadius),
			0,
			1,
		);

		tmpColorA.lerpColors(warmCore, midBlue, coreT);
		tmpColorB.lerpColors(midBlue, outerPurple, outerT);
		tmpColor.lerpColors(tmpColorA, tmpColorB, outerT);

		// Brightness variation (sparkle without animation)
		const brightness = 0.55 + Math.random() * 0.65;
		tmpColor.multiplyScalar(brightness);

		colors[i * 3] = tmpColor.r;
		colors[i * 3 + 1] = tmpColor.g;
		colors[i * 3 + 2] = tmpColor.b;
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
	geometry.computeBoundingSphere();
	return geometry;
}

function makeRadialTexture(inner: string, outer: string) {
	if (typeof document === 'undefined') return null;

	const size = 256;
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;

	const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
	g.addColorStop(0, inner);
	g.addColorStop(0.35, inner);
	g.addColorStop(1, outer);

	ctx.fillStyle = g;
	ctx.fillRect(0, 0, size, size);

	const tex = new THREE.CanvasTexture(canvas);
	tex.minFilter = THREE.LinearFilter;
	tex.magFilter = THREE.LinearFilter;
	tex.wrapS = THREE.ClampToEdgeWrapping;
	tex.wrapT = THREE.ClampToEdgeWrapping;
	return tex;
}

function CameraRig() {
	useFrame(state => {
		const t = state.clock.elapsedTime;

		// Slow cinematic drift around the disc
		const orbit = 2.15;
		state.camera.position.x = Math.sin(t * 0.06) * 0.35;
		state.camera.position.z = orbit + Math.cos(t * 0.06) * 0.35;
		state.camera.position.y = Math.sin(t * 0.04) * 0.12;

		state.camera.lookAt(0, 0, 0);
	});
	return null;
}

function DistantStars() {
	const ref = useRef<ThreePoints>(null);
	const [sphere] = useState(() => generateSpherePoints(2600, 6));
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	useFrame((_, delta) => {
		if (ref.current) ref.current.rotation.y -= delta * 0.01;
	});

	return (
		<DreiPoints ref={ref} positions={sphere} stride={3} frustumCulled={false}>
			<PointMaterial
				transparent
				color={isDark ? '#ffffff' : '#4f46e5'}
				size={0.00125}
				sizeAttenuation
				depthWrite={false}
				opacity={isDark ? 0.5 : 0.22}
			/>
		</DreiPoints>
	);
}

function Galaxy() {
	const groupRef = useRef<THREE.Group>(null);
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	const coreTex = useMemo(
		() =>
			makeRadialTexture(
				isDark ? 'rgba(255, 247, 237, 0.95)' : 'rgba(99, 102, 241, 0.35)',
				'rgba(0,0,0,0)',
			),
		[isDark],
	);

	const nebulaTex = useMemo(
		() =>
			makeRadialTexture(
				isDark ? 'rgba(167, 139, 250, 0.16)' : 'rgba(99, 102, 241, 0.10)',
				'rgba(0,0,0,0)',
			),
		[isDark],
	);

	const coreGeometry = useMemo(
		() =>
			buildGalaxyGeometry(
				{
					count: 5200,
					arms: 1,
					radius: 0.75,
					coreRadius: 0.6,
					twist: 0.0,
					armSpread: 1.2,
					thickness: 0.14,
					jitter: 0.02,
				},
				isDark,
			),
		[isDark],
	);

	const armGeometry = useMemo(
		() =>
			buildGalaxyGeometry(
				{
					count: 14000,
					arms: 4,
					radius: 3.25,
					coreRadius: 0.8,
					twist: 1.55,
					armSpread: 0.24,
					thickness: 0.12,
					jitter: 0.02,
				},
				isDark,
			),
		[isDark],
	);

	const dustGeometry = useMemo(
		() =>
			buildGalaxyGeometry(
				{
					count: 11000,
					arms: 4,
					radius: 3.4,
					coreRadius: 0.9,
					twist: 1.45,
					armSpread: 0.45,
					thickness: 0.18,
					jitter: 0.03,
				},
				isDark,
			),
		[isDark],
	);

	useFrame((_, delta) => {
		if (!groupRef.current) return;
		groupRef.current.rotation.y += delta * 0.03;
		groupRef.current.rotation.z = Math.sin(performance.now() * 0.00008) * 0.02;
	});

	return (
		<group ref={groupRef} rotation={[-0.35, 0, 0.15]}>
			{/* Nebula disc (soft glow) */}
			{nebulaTex && (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
					<planeGeometry args={[8.2, 8.2, 1, 1]} />
					<meshBasicMaterial
						map={nebulaTex}
						transparent
						opacity={isDark ? 0.55 : 0.25}
						blending={THREE.AdditiveBlending}
						depthWrite={false}
					/>
				</mesh>
			)}

			{/* Core glow */}
			{coreTex && (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
					<planeGeometry args={[2.2, 2.2, 1, 1]} />
					<meshBasicMaterial
						map={coreTex}
						transparent
						opacity={isDark ? 0.85 : 0.28}
						blending={THREE.AdditiveBlending}
						depthWrite={false}
					/>
				</mesh>
			)}

			{/* Dust layer */}
			<points geometry={dustGeometry} frustumCulled={false}>
				<pointsMaterial
					transparent
					vertexColors
					size={0.008}
					sizeAttenuation
					opacity={isDark ? 0.22 : 0.12}
					depthWrite={false}
					blending={THREE.AdditiveBlending}
				/>
			</points>

			{/* Main spiral arms */}
			<points geometry={armGeometry} frustumCulled={false}>
				<pointsMaterial
					transparent
					vertexColors
					size={0.012}
					sizeAttenuation
					opacity={isDark ? 0.85 : 0.45}
					depthWrite={false}
					blending={THREE.AdditiveBlending}
				/>
			</points>

			{/* Dense core stars */}
			<points geometry={coreGeometry} frustumCulled={false}>
				<pointsMaterial
					transparent
					vertexColors
					size={0.016}
					sizeAttenuation
					opacity={isDark ? 0.95 : 0.35}
					depthWrite={false}
					blending={THREE.AdditiveBlending}
				/>
			</points>
		</group>
	);
}

function ShootingStar() {
	const ref = useRef<Mesh>(null);
	const [resetKey, setResetKey] = useState(0);

	useFrame(() => {
		if (!ref.current) return;

		ref.current.position.x -= 0.12;
		ref.current.position.y -= 0.04;

		if (ref.current.position.x < -5) {
			const startX = 4 + Math.random() * 2.5;
			const startY = 1.2 + Math.random() * 1.2;
			const startZ = -1.5 + Math.random() * 3;
			ref.current.position.set(startX, startY, startZ);
			setResetKey(prev => prev + 1);
		}
	});

	return (
		<mesh ref={ref} position={[4, 2.4, 0]}>
			<sphereGeometry args={[0.02, 8, 8]} />
			<meshBasicMaterial color="#ffffff" transparent opacity={0} />
			<Trail
				key={resetKey}
				width={1}
				length={10}
				color={new THREE.Color('#a78bfa')}
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

export function Background3D() {
	const [hasWebGLError, setHasWebGLError] = useState(false);

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
					dpr={[1, 1.5]}
					gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
					camera={{ position: [0, 0, 2.3], fov: 55, near: 0.1, far: 50 }}
					onCreated={({ gl }) => {
						if (!gl) setHasWebGLError(true);
					}}
				>
					<ambientLight intensity={0.35} />
					<pointLight position={[6, 6, 6]} intensity={1.1} />

					<CameraRig />
					<DistantStars />
					<Galaxy />
					<ShootingStar />
				</Canvas>
			</ErrorBoundary>
		</div>
	);
}
