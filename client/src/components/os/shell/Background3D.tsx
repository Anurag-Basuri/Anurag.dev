'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points as DreiPoints, PointMaterial } from '@react-three/drei';
import { useTheme } from 'next-themes';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { Points as ThreePoints } from 'three';
import * as THREE from 'three';

function randn() {
	let u = 0;
	let v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

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

type GalaxyLayerParams = {
	count: number;
	arms: number;
	radius: number;
	coreRadius: number;
	twist: number;
	armSpread: number;
	thickness: number;
	jitter: number;
};

function buildGalaxyGeometry(params: GalaxyLayerParams, isDark: boolean) {
	const positions = new Float32Array(params.count * 3);
	const colors = new Float32Array(params.count * 3);

	const warmCore = new THREE.Color(isDark ? '#fff7ed' : '#312e81');
	const midBlue = new THREE.Color(isDark ? '#93c5fd' : '#4f46e5');
	const outerPurple = new THREE.Color(isDark ? '#a78bfa' : '#6366f1');

	const tmpA = new THREE.Color();
	const tmpB = new THREE.Color();
	const tmp = new THREE.Color();

	for (let i = 0; i < params.count; i++) {
		const r01 = Math.pow(Math.random(), 0.58);
		const r = r01 * params.radius;

		const arm = i % params.arms;
		const armAngle = (arm / params.arms) * Math.PI * 2;

		const spiral = r * params.twist;
		const spread = randn() * params.armSpread * (0.35 + 0.65 * (r / params.radius));
		const angle = armAngle + spiral + spread;

		const jitter = params.jitter * (0.35 + 0.65 * (1 - r01));
		const x = Math.cos(angle) * r + randn() * jitter;
		const z = Math.sin(angle) * r + randn() * jitter;

		const thickness = params.thickness * (0.25 + 0.75 * (1 - r01));
		const y = randn() * thickness;

		positions[i * 3] = x;
		positions[i * 3 + 1] = y;
		positions[i * 3 + 2] = z;

		const coreT = THREE.MathUtils.clamp(r / params.coreRadius, 0, 1);
		const outerT = THREE.MathUtils.clamp(
			(r - params.coreRadius) / (params.radius - params.coreRadius),
			0,
			1,
		);

		tmpA.lerpColors(warmCore, midBlue, coreT);
		tmpB.lerpColors(midBlue, outerPurple, outerT);
		tmp.lerpColors(tmpA, tmpB, outerT);

		const brightness = 0.55 + Math.random() * 0.55;
		tmp.multiplyScalar(brightness);

		colors[i * 3] = tmp.r;
		colors[i * 3 + 1] = tmp.g;
		colors[i * 3 + 2] = tmp.b;
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
	g.addColorStop(0.28, inner);
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
	const targetPos = useRef(new THREE.Vector3());
	useFrame(state => {
		const t = state.clock.elapsedTime;

		targetPos.current.set(
			Math.sin(t * 0.06) * 0.32,
			Math.sin(t * 0.045) * 0.1,
			2.2 + Math.cos(t * 0.06) * 0.28,
		);

		state.camera.position.lerp(targetPos.current, 0.03);
		state.camera.lookAt(0, 0, 0);
	});
	return null;
}

function DistantStars({ isDark }: { isDark: boolean }) {
	const ref = useRef<ThreePoints>(null);
	const [sphere] = useState(() => generateSpherePoints(2200, 7));

	useFrame((_, delta) => {
		if (ref.current) ref.current.rotation.y -= delta * 0.006;
	});

	return (
		<DreiPoints ref={ref} positions={sphere} stride={3} frustumCulled={false}>
			<PointMaterial
				transparent
				color={isDark ? '#ffffff' : '#4f46e5'}
				size={0.00115}
				sizeAttenuation
				depthWrite={false}
				opacity={isDark ? 0.45 : 0.18}
			/>
		</DreiPoints>
	);
}

function Galaxy({ isDark }: { isDark: boolean }) {
	const groupRef = useRef<THREE.Group>(null);

	const coreTex = useMemo(
		() =>
			makeRadialTexture(
				isDark ? 'rgba(255, 247, 237, 0.92)' : 'rgba(99, 102, 241, 0.28)',
				'rgba(0,0,0,0)',
			),
		[isDark],
	);

	const nebulaTex = useMemo(
		() =>
			makeRadialTexture(
				isDark ? 'rgba(167, 139, 250, 0.14)' : 'rgba(99, 102, 241, 0.08)',
				'rgba(0,0,0,0)',
			),
		[isDark],
	);

	const haloGeometry = useMemo(() => {
		// A faint spheroidal halo around the disc for depth
		const count = 3500;
		const positions = new Float32Array(count * 3);
		for (let i = 0; i < count; i++) {
			const r = Math.pow(Math.random(), 0.9) * 5.5;
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);

			// Squash halo slightly along Y to stay galaxy-like
			const x = Math.sin(phi) * Math.cos(theta) * r;
			const y = Math.cos(phi) * r * 0.45;
			const z = Math.sin(phi) * Math.sin(theta) * r;

			positions[i * 3] = x;
			positions[i * 3 + 1] = y;
			positions[i * 3 + 2] = z;
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		g.computeBoundingSphere();
		return g;
	}, []);

	const coreGeometry = useMemo(
		() =>
			buildGalaxyGeometry(
				{
					count: 4200,
					arms: 1,
					radius: 0.8,
					coreRadius: 0.65,
					twist: 0.0,
					armSpread: 1.1,
					thickness: 0.14,
					jitter: 0.02,
				},
				isDark,
			),
		[isDark],
	);

	const armsGeometry = useMemo(
		() =>
			buildGalaxyGeometry(
				{
					count: 10500,
					arms: 4,
					radius: 3.4,
					coreRadius: 0.85,
					twist: 1.7,
					armSpread: 0.23,
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
					count: 8200,
					arms: 4,
					radius: 3.8,
					coreRadius: 1.0,
					twist: 1.55,
					armSpread: 0.48,
					thickness: 0.18,
					jitter: 0.03,
				},
				isDark,
			),
		[isDark],
	);

	useFrame(state => {
		if (!groupRef.current) return;
		const t = state.clock.elapsedTime;

		groupRef.current.rotation.y = t * 0.03;
		groupRef.current.rotation.x = -0.35 + Math.sin(t * 0.05) * 0.01;
		groupRef.current.rotation.z = 0.15 + Math.sin(t * 0.04) * 0.008;
	});

	return (
		<group ref={groupRef} rotation={[-0.35, 0, 0.15]}>
			{/* Soft nebula disc */}
			{nebulaTex && (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
					<planeGeometry args={[8.6, 8.6, 1, 1]} />
					<meshBasicMaterial
						map={nebulaTex}
						transparent
						opacity={isDark ? 0.5 : 0.22}
						blending={THREE.AdditiveBlending}
						depthWrite={false}
					/>
				</mesh>
			)}

			{/* Core glow */}
			{coreTex && (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
					<planeGeometry args={[2.4, 2.4, 1, 1]} />
					<meshBasicMaterial
						map={coreTex}
						transparent
						opacity={isDark ? 0.82 : 0.25}
						blending={THREE.AdditiveBlending}
						depthWrite={false}
					/>
				</mesh>
			)}

			{/* Faint halo points */}
			<points geometry={haloGeometry} frustumCulled={false}>
				<pointsMaterial
					transparent
					color={isDark ? '#ffffff' : '#4f46e5'}
					size={0.006}
					sizeAttenuation
					opacity={isDark ? 0.06 : 0.035}
					depthWrite={false}
					blending={THREE.AdditiveBlending}
				/>
			</points>

			{/* Dust */}
			<points geometry={dustGeometry} frustumCulled={false}>
				<pointsMaterial
					transparent
					vertexColors
					size={0.008}
					sizeAttenuation
					opacity={isDark ? 0.18 : 0.1}
					depthWrite={false}
					blending={THREE.AdditiveBlending}
				/>
			</points>

			{/* Spiral arms */}
			<points geometry={armsGeometry} frustumCulled={false}>
				<pointsMaterial
					transparent
					vertexColors
					size={0.011}
					sizeAttenuation
					opacity={isDark ? 0.78 : 0.4}
					depthWrite={false}
					blending={THREE.AdditiveBlending}
				/>
			</points>

			{/* Core stars */}
			<points geometry={coreGeometry} frustumCulled={false}>
				<pointsMaterial
					transparent
					vertexColors
					size={0.014}
					sizeAttenuation
					opacity={isDark ? 0.9 : 0.3}
					depthWrite={false}
					blending={THREE.AdditiveBlending}
				/>
			</points>
		</group>
	);
}

export function Background3D() {
	const [hasWebGLError, setHasWebGLError] = useState(false);
	const { theme } = useTheme();
	const isDark = theme === 'dark';

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
					camera={{ position: [0, 0, 2.2], fov: 55, near: 0.1, far: 60 }}
					onCreated={({ gl }) => {
						if (!gl) setHasWebGLError(true);
					}}
				>
					<ambientLight intensity={0.35} />
					<pointLight position={[6, 6, 6]} intensity={1.1} />

					<CameraRig />
					<DistantStars isDark={isDark} />
					<Galaxy isDark={isDark} />
				</Canvas>
			</ErrorBoundary>
		</div>
	);
}
