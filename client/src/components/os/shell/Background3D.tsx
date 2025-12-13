'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTheme } from 'next-themes';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { Points as ThreePoints, LineSegments as ThreeLineSegments } from 'three';
import * as THREE from 'three';

function randn() {
	let u = 0;
	let v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
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

type SpiralParams = {
	arms: number;
	radius: number;
	coreRadius: number;
	twist: number;
	armSpread: number;
	thickness: number;
	jitter: number;
};

type CodeNebulaParams = SpiralParams & {
	segmentCount: number;
	dotCount: number;
	haloCount: number;
};

function sampleSpiralPoint(params: SpiralParams) {
	const r01 = Math.pow(Math.random(), 0.6);
	const r = r01 * params.radius;

	const arm = Math.floor(Math.random() * params.arms);
	const armAngle = (arm / params.arms) * Math.PI * 2;

	const spiral = r * params.twist;
	const spread = randn() * params.armSpread * (0.35 + 0.65 * (r / params.radius));
	const angle = armAngle + spiral + spread;

	const jitter = params.jitter * (0.35 + 0.65 * (1 - r01));
	const x = Math.cos(angle) * r + randn() * jitter;
	const z = Math.sin(angle) * r + randn() * jitter;

	const thickness = params.thickness * (0.25 + 0.75 * (1 - r01));
	const y = randn() * thickness;

	return { x, y, z, r01, r, angle };
}

function buildCodeSegmentsGeometry(params: CodeNebulaParams, isDark: boolean) {
	// Each segment = 2 vertices
	const positions = new Float32Array(params.segmentCount * 2 * 3);
	const colors = new Float32Array(params.segmentCount * 2 * 3);

	const cCore = new THREE.Color(isDark ? '#dbeafe' : '#312e81'); // icy core
	const cMid = new THREE.Color(isDark ? '#a78bfa' : '#4f46e5'); // indigo
	const cOuter = new THREE.Color(isDark ? '#34d399' : '#0f766e'); // techy mint/teal accent

	const tmpA = new THREE.Color();
	const tmpB = new THREE.Color();
	const tmp = new THREE.Color();

	// Direction palette to look like "code fragments" (horizontal/vertical/diagonal)
	const dirs = [
		new THREE.Vector3(1, 0, 0),
		new THREE.Vector3(0, 0, 1),
		new THREE.Vector3(1, 0, 1).normalize(),
		new THREE.Vector3(1, 0, -1).normalize(),
		new THREE.Vector3(0.85, 0.2, 0).normalize(),
		new THREE.Vector3(0, 0.2, 0.85).normalize(),
	];

	for (let i = 0; i < params.segmentCount; i++) {
		const p = sampleSpiralPoint(params);
		const base = new THREE.Vector3(p.x, p.y, p.z);

		// Slightly more structured near arms: align segment a bit with tangential direction
		const tangent = new THREE.Vector3(-Math.sin(p.angle), 0, Math.cos(p.angle)).normalize();

		const dirChoice = dirs[(Math.random() * dirs.length) | 0].clone();
		const dir = dirChoice.lerp(tangent, 0.35).normalize();

		// Segment length: tiny (keeps it subtle and crisp)
		const len = (0.012 + Math.random() * 0.03) * (0.55 + 0.45 * (1 - p.r01));

		const a = base.clone().addScaledVector(dir, -len * 0.5);
		const b = base.clone().addScaledVector(dir, len * 0.5);

		const idx = i * 6;
		positions[idx] = a.x;
		positions[idx + 1] = a.y;
		positions[idx + 2] = a.z;
		positions[idx + 3] = b.x;
		positions[idx + 4] = b.y;
		positions[idx + 5] = b.z;

		// Color gradient: core -> mid -> outer, with slight brightness variation
		const coreT = THREE.MathUtils.clamp(p.r / params.coreRadius, 0, 1);
		const outerT = THREE.MathUtils.clamp(
			(p.r - params.coreRadius) / (params.radius - params.coreRadius),
			0,
			1,
		);

		tmpA.lerpColors(cCore, cMid, coreT);
		tmpB.lerpColors(cMid, cOuter, outerT);
		tmp.lerpColors(tmpA, tmpB, outerT);

		const brightness = 0.55 + Math.random() * 0.55;
		tmp.multiplyScalar(brightness);

		colors[idx] = tmp.r;
		colors[idx + 1] = tmp.g;
		colors[idx + 2] = tmp.b;
		colors[idx + 3] = tmp.r;
		colors[idx + 4] = tmp.g;
		colors[idx + 5] = tmp.b;
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
	geometry.computeBoundingSphere();
	return geometry;
}

function buildCodeDotsGeometry(params: CodeNebulaParams, isDark: boolean) {
	const positions = new Float32Array(params.dotCount * 3);
	const colors = new Float32Array(params.dotCount * 3);

	const cCore = new THREE.Color(isDark ? '#ffffff' : '#312e81');
	const cMid = new THREE.Color(isDark ? '#93c5fd' : '#4f46e5');
	const cOuter = new THREE.Color(isDark ? '#a78bfa' : '#6366f1');

	const tmpA = new THREE.Color();
	const tmpB = new THREE.Color();
	const tmp = new THREE.Color();

	for (let i = 0; i < params.dotCount; i++) {
		const p = sampleSpiralPoint(params);

		const idx = i * 3;
		positions[idx] = p.x;
		positions[idx + 1] = p.y;
		positions[idx + 2] = p.z;

		const coreT = THREE.MathUtils.clamp(p.r / params.coreRadius, 0, 1);
		const outerT = THREE.MathUtils.clamp(
			(p.r - params.coreRadius) / (params.radius - params.coreRadius),
			0,
			1,
		);

		tmpA.lerpColors(cCore, cMid, coreT);
		tmpB.lerpColors(cMid, cOuter, outerT);
		tmp.lerpColors(tmpA, tmpB, outerT);

		const brightness = 0.4 + Math.random() * 0.7;
		tmp.multiplyScalar(brightness);

		colors[idx] = tmp.r;
		colors[idx + 1] = tmp.g;
		colors[idx + 2] = tmp.b;
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
	geometry.computeBoundingSphere();
	return geometry;
}

function buildHaloBitsGeometry(count: number, isDark: boolean) {
	const positions = new Float32Array(count * 2 * 3);

	for (let i = 0; i < count; i++) {
		const r = Math.pow(Math.random(), 0.92) * 6.2;
		const theta = Math.random() * Math.PI * 2;
		const phi = Math.acos(2 * Math.random() - 1);

		const x = Math.sin(phi) * Math.cos(theta) * r;
		const y = Math.cos(phi) * r * 0.35;
		const z = Math.sin(phi) * Math.sin(theta) * r;

		const dir = new THREE.Vector3(randn(), randn() * 0.35, randn()).normalize();
		const len = 0.01 + Math.random() * 0.02;

		const a = new THREE.Vector3(x, y, z).addScaledVector(dir, -len);
		const b = new THREE.Vector3(x, y, z).addScaledVector(dir, len);

		const idx = i * 6;
		positions[idx] = a.x;
		positions[idx + 1] = a.y;
		positions[idx + 2] = a.z;
		positions[idx + 3] = b.x;
		positions[idx + 4] = b.y;
		positions[idx + 5] = b.z;
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.computeBoundingSphere();
	return geometry;
}

function CameraRig() {
	const targetPos = useRef(new THREE.Vector3());
	useFrame(state => {
		const t = state.clock.elapsedTime;

		// Ambient drift only (no jitter/glitch)
		targetPos.current.set(
			Math.sin(t * 0.05) * 0.28,
			Math.sin(t * 0.035) * 0.085,
			2.25 + Math.cos(t * 0.05) * 0.22,
		);

		state.camera.position.lerp(targetPos.current, 0.028);
		state.camera.lookAt(0, 0, 0);
	});
	return null;
}

function CodeNebulaGalaxy({ isDark }: { isDark: boolean }) {
	const groupRef = useRef<THREE.Group>(null);
	const coreGlowRef = useRef<THREE.MeshBasicMaterial>(null);

	// Keep these subtle for readability
	const opacityLines = isDark ? 0.11 : 0.06; // requested range ~0.05–0.12
	const opacityDots = isDark ? 0.09 : 0.05;
	const opacityHalo = isDark ? 0.05 : 0.03;

	const params: CodeNebulaParams = useMemo(
		() => ({
			arms: 4,
			radius: 3.8,
			coreRadius: 0.9,
			twist: 1.55,
			armSpread: 0.26,
			thickness: 0.16,
			jitter: 0.02,
			segmentCount: 9000,
			dotCount: 5200,
			haloCount: 2600,
		}),
		[],
	);

	const coreTex = useMemo(
		() =>
			makeRadialTexture(
				isDark ? 'rgba(255,255,255,0.55)' : 'rgba(99,102,241,0.18)',
				'rgba(0,0,0,0)',
			),
		[isDark],
	);

	const nebulaTex = useMemo(
		() =>
			makeRadialTexture(
				isDark ? 'rgba(52,211,153,0.07)' : 'rgba(99,102,241,0.05)',
				'rgba(0,0,0,0)',
			),
		[isDark],
	);

	const segGeometry = useMemo(() => buildCodeSegmentsGeometry(params, isDark), [params, isDark]);
	const dotGeometry = useMemo(() => buildCodeDotsGeometry(params, isDark), [params, isDark]);
	const haloGeometry = useMemo(
		() => buildHaloBitsGeometry(params.haloCount, isDark),
		[params, isDark],
	);

	useFrame(state => {
		if (!groupRef.current) return;
		const t = state.clock.elapsedTime;

		// Ambient motion: slow drift + slight breathing tilt
		groupRef.current.rotation.y = t * 0.022;
		groupRef.current.rotation.x = -0.34 + Math.sin(t * 0.035) * 0.01;
		groupRef.current.rotation.z = 0.14 + Math.sin(t * 0.028) * 0.008;

		if (coreGlowRef.current) {
			const base = isDark ? 0.3 : 0.14;
			coreGlowRef.current.opacity = base + Math.sin(t * 0.18) * (isDark ? 0.03 : 0.02);
		}
	});

	return (
		<group ref={groupRef} rotation={[-0.34, 0, 0.14]}>
			{/* Ultra-soft nebula haze (keeps it "space", still readable) */}
			{nebulaTex && (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
					<planeGeometry args={[9.0, 9.0, 1, 1]} />
					<meshBasicMaterial
						map={nebulaTex}
						transparent
						opacity={isDark ? 0.22 : 0.12}
						blending={THREE.AdditiveBlending}
						depthWrite={false}
					/>
				</mesh>
			)}

			{/* Soft core glow */}
			{coreTex && (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
					<planeGeometry args={[2.8, 2.8, 1, 1]} />
					<meshBasicMaterial
						ref={coreGlowRef}
						map={coreTex}
						transparent
						opacity={isDark ? 0.3 : 0.14}
						blending={THREE.AdditiveBlending}
						depthWrite={false}
					/>
				</mesh>
			)}

			{/* Halo micro-fragments */}
			<lineSegments geometry={haloGeometry} frustumCulled={false}>
				<lineBasicMaterial
					transparent
					color={isDark ? '#ffffff' : '#4f46e5'}
					opacity={opacityHalo}
					blending={THREE.AdditiveBlending}
					depthWrite={false}
				/>
			</lineSegments>

			{/* Code fragments (tiny segments) */}
			<lineSegments geometry={segGeometry} frustumCulled={false}>
				<lineBasicMaterial
					transparent
					vertexColors
					opacity={opacityLines}
					blending={THREE.AdditiveBlending}
					depthWrite={false}
				/>
			</lineSegments>

			{/* Code dots (tiny punctuation / “tokens”) */}
			<points geometry={dotGeometry} frustumCulled={false}>
				<pointsMaterial
					transparent
					vertexColors
					size={0.01}
					sizeAttenuation
					opacity={opacityDots}
					blending={THREE.AdditiveBlending}
					depthWrite={false}
				/>
			</points>
		</group>
	);
}

function BackgroundBits({ isDark }: { isDark: boolean }) {
	const ref = useRef<ThreeLineSegments>(null);
	const geometry = useMemo(() => buildHaloBitsGeometry(2200, isDark), [isDark]);

	useFrame((_, delta) => {
		if (!ref.current) return;
		ref.current.rotation.y -= delta * 0.004;
	});

	return (
		<lineSegments ref={ref} geometry={geometry} frustumCulled={false}>
			<lineBasicMaterial
				transparent
				color={isDark ? '#ffffff' : '#4f46e5'}
				opacity={isDark ? 0.035 : 0.02}
				blending={THREE.AdditiveBlending}
				depthWrite={false}
			/>
		</lineSegments>
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
					dpr={[1, 1.35]}
					gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
					camera={{ position: [0, 0, 2.25], fov: 55, near: 0.1, far: 70 }}
					onCreated={({ gl }) => {
						if (!gl) setHasWebGLError(true);
					}}
				>
					<ambientLight intensity={0.32} />
					<pointLight position={[6, 6, 6]} intensity={1.05} />

					<CameraRig />
					<BackgroundBits isDark={isDark} />
					<CodeNebulaGalaxy isDark={isDark} />
				</Canvas>
			</ErrorBoundary>
		</div>
	);
}
