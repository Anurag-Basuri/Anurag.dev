'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback, MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Line, Float } from '@react-three/drei';
import { useTheme } from 'next-themes';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { Points as ThreePoints, Vector3 } from 'three';
import * as THREE from 'three';
import { useThemeColor } from '@/hooks/use-theme-colors';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Perf } from 'r3f-perf';

// --- Configuration ---
const CONFIG = {
	STARS: {
		DISTANT: { count: 3000, radius: 100, size: 0.02, opacity: 0.6, rotationSpeed: 0.005 },
		MEDIUM: { count: 1500, radius: 50, size: 0.04, opacity: 0.8, rotationSpeed: 0.01 },
		CLOSE: { count: 500, radius: 25, size: 0.08, opacity: 0.9, rotationSpeed: 0.02 },
	},
	PARTICLES: {
		count: 300,
		bounds: { x: 25, y: 15, z: 30 },
		sizeRange: { min: 0.02, max: 0.1 },
		velocityRange: 0.002,
		opacityRange: { min: 0.3, max: 1.0 },
	},
	SHOOTING_STARS: {
		count: 4,
		maxTrailLength: 20,
		lifeRange: { min: 2, max: 5 },
		velocityY: { min: -1.0, max: -0.5 },
	},
	CONSTELLATIONS: {
		count: 8,
		pointsPerConstellation: { min: 5, max: 9 },
		spread: 4,
	},
	CAMERA: {
		defaultPosition: [0, 2, 5] as [number, number, number],
		fov: 75,
		near: 0.1,
		far: 200,
		lookAt: [0, -0.5, -3] as [number, number, number],
	},
	PERFORMANCE: {
		maxDPR: 1.5,
		simpleDPR: 1,
	},
} as const;

// --- Types ---
interface Particle {
	position: Vector3;
	velocity: Vector3;
	size: number;
	originalSize: number;
	opacity: number;
	color: string;
}

interface ShootingStar {
	position: Vector3;
	velocity: Vector3;
	trail: Vector3[];
	maxTrailLength: number;
	active: boolean;
	life: number;
	maxLife: number;
}

// --- Utilities ---
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

function generateStarPoints(
	count: number,
	radius: number,
	shape: 'sphere' | 'disc' | 'galaxy' = 'sphere',
) {
	const points = new Float32Array(count * 3);
	const colors = new Float32Array(count * 3);

	for (let i = 0; i < count; i++) {
		let x, y, z;
		const u = Math.random();
		const v = Math.random();
		let r;

		switch (shape) {
			case 'disc': {
				const angle = 2 * Math.PI * u;
				r = Math.pow(Math.random(), 0.5) * radius;
				x = r * Math.cos(angle);
				y = (Math.random() - 0.5) * radius * 0.1;
				z = r * Math.sin(angle);
				break;
			}
			case 'galaxy': {
				const spiralAngle = 2 * Math.PI * u;
				const spiralRadius = Math.pow(Math.random(), 0.7) * radius;
				const armCount = 3;
				const armOffset = 0.3;
				const armAngle = spiralAngle + armOffset * Math.sin(spiralAngle * armCount);

				x = spiralRadius * Math.cos(armAngle);
				y = (Math.random() - 0.5) * radius * 0.15;
				z = spiralRadius * Math.sin(armAngle);
				break;
			}
			default: {
				const theta = 2 * Math.PI * u;
				const phi = Math.acos(2 * v - 1);
				r = Math.cbrt(Math.random()) * radius;

				x = r * Math.sin(phi) * Math.cos(theta);
				y = r * Math.sin(phi) * Math.sin(theta);
				z = r * Math.cos(phi);
			}
		}

		points[i * 3] = x;
		points[i * 3 + 1] = y;
		points[i * 3 + 2] = z;

		const brightness = 0.7 + Math.random() * 0.3;
		colors[i * 3] = brightness;
		colors[i * 3 + 1] = brightness * 0.9;
		colors[i * 3 + 2] = 1.0;
	}

	return { positions: points, colors };
}

function generateParticles(count: number, bounds: { x: number; y: number; z: number }): Particle[] {
	return Array.from({ length: count }, () => {
		const size =
			CONFIG.PARTICLES.sizeRange.min +
			Math.random() * (CONFIG.PARTICLES.sizeRange.max - CONFIG.PARTICLES.sizeRange.min);
		return {
			position: new THREE.Vector3(
				(Math.random() - 0.5) * bounds.x,
				(Math.random() - 0.5) * bounds.y,
				(Math.random() - 0.5) * bounds.z,
			),
			velocity: new THREE.Vector3(
				(Math.random() - 0.5) * CONFIG.PARTICLES.velocityRange,
				(Math.random() - 0.5) * CONFIG.PARTICLES.velocityRange,
				(Math.random() - 0.5) * CONFIG.PARTICLES.velocityRange,
			),
			size,
			originalSize: size,
			opacity:
				CONFIG.PARTICLES.opacityRange.min +
				Math.random() *
					(CONFIG.PARTICLES.opacityRange.max - CONFIG.PARTICLES.opacityRange.min),
			color: Math.random() > 0.5 ? '#60a5fa' : '#38bdf8',
		};
	});
}

// --- Components ---

const ConstellationLines = React.memo(() => {
	const { theme } = useTheme();
	const lineColor = useThemeColor('--primary', theme === 'dark' ? '#93c5fd' : '#1e40af');

	const [constellations] = useState<Vector3[][]>(() => {
		const newConstellations: Vector3[][] = [];
		for (let i = 0; i < CONFIG.CONSTELLATIONS.count; i++) {
			const points = [];
			const center = new THREE.Vector3(
				(Math.random() - 0.5) * 20,
				(Math.random() - 0.5) * 10,
				(Math.random() - 0.5) * 30 - 10,
			);

			const pointCount =
				CONFIG.CONSTELLATIONS.pointsPerConstellation.min +
				Math.floor(
					Math.random() *
						(CONFIG.CONSTELLATIONS.pointsPerConstellation.max -
							CONFIG.CONSTELLATIONS.pointsPerConstellation.min),
				);

			for (let j = 0; j < pointCount; j++) {
				points.push(
					center
						.clone()
						.add(
							new THREE.Vector3(
								(Math.random() - 0.5) * CONFIG.CONSTELLATIONS.spread,
								(Math.random() - 0.5) * CONFIG.CONSTELLATIONS.spread,
								(Math.random() - 0.5) * CONFIG.CONSTELLATIONS.spread,
							),
						),
				);
			}
			newConstellations.push(points);
		}
		return newConstellations;
	});

	return (
		<>
			{constellations.map((points, idx) => (
				<Line
					key={idx}
					points={points}
					color={lineColor}
					lineWidth={0.5}
					opacity={0.3}
					transparent
					dashed
					dashSize={0.5}
					gapSize={0.2}
				/>
			))}
		</>
	);
});

const ShootingStars = React.memo(function ShootingStars({
	count = 3,
	reducedMotion,
}: {
	count: number;
	reducedMotion: boolean;
}) {
	const [stars, setStars] = useState<ShootingStar[]>(() => {
		const newStars: ShootingStar[] = [];
		for (let i = 0; i < count; i++) {
			newStars.push({
				position: new THREE.Vector3(
					(Math.random() - 0.5) * 30,
					10 + Math.random() * 5,
					(Math.random() - 0.5) * 20 - 10,
				),
				velocity: new THREE.Vector3(
					(Math.random() - 0.5) * 0.3,
					-0.5 - Math.random() * 0.5,
					(Math.random() - 0.5) * 0.2,
				),
				trail: [],
				maxTrailLength: 20,
				active: true,
				life: 1,
				maxLife: 2 + Math.random() * 3,
			});
		}
		return newStars;
	});

	useEffect(() => {
		const newStars: ShootingStar[] = [];
		for (let i = 0; i < count; i++) {
			newStars.push({
				position: new THREE.Vector3(
					(Math.random() - 0.5) * 30,
					10 + Math.random() * 5,
					(Math.random() - 0.5) * 20 - 10,
				),
				velocity: new THREE.Vector3(
					(Math.random() - 0.5) * 0.3,
					-0.5 - Math.random() * 0.5,
					(Math.random() - 0.5) * 0.2,
				),
				trail: [],
				maxTrailLength: 20,
				active: true,
				life: 1,
				maxLife: 2 + Math.random() * 3,
			});
		}
		setStars(newStars);
	}, [count]);

	useFrame((state, delta) => {
		if (reducedMotion) return;

		setStars(prev =>
			prev.map(star => {
				if (!star.active) return star;

				star.position.add(star.velocity.clone().multiplyScalar(delta * 60));
				star.trail.push(star.position.clone());
				if (star.trail.length > star.maxTrailLength) {
					star.trail.shift();
				}
				star.life -= delta;
				if (star.life <= 0) {
					star.position.set(
						(Math.random() - 0.5) * 30,
						10 + Math.random() * 5,
						(Math.random() - 0.5) * 20 - 10,
					);
					star.velocity.set(
						(Math.random() - 0.5) * 0.3,
						-0.5 - Math.random() * 0.5,
						(Math.random() - 0.5) * 0.2,
					);
					star.trail = [];
					star.life = star.maxLife;
				}
				return { ...star };
			}),
		);
	});

	return (
		<>
			{stars.map((star, idx) => (
				<group key={idx}>
					<Points
						positions={Float32Array.from([
							star.position.x,
							star.position.y,
							star.position.z,
						])}
					>
						<PointMaterial
							transparent
							color="#ffffff"
							size={0.15}
							sizeAttenuation
							depthWrite={false}
							blending={THREE.AdditiveBlending}
						/>
					</Points>
					{star.trail.length > 1 && (
						<Line
							points={star.trail}
							color="#60a5fa"
							lineWidth={1}
							transparent
							opacity={0.7}
						/>
					)}
				</group>
			))}
		</>
	);
});

const NebulaField = React.memo(function NebulaField({ reducedMotion }: { reducedMotion: boolean }) {
	const meshRef = useRef<THREE.Mesh>(null);
	const materialRef = useRef<THREE.ShaderMaterial>(null);

	const { theme } = useTheme();
	const primaryColor = useThemeColor('--primary', '#10b981');
	const accentColor = useThemeColor('--accent', '#6366f1');

	const shader = useMemo(
		() => ({
			uniforms: {
				time: { value: 0 },
				color1: { value: new THREE.Color(primaryColor) },
				color2: { value: new THREE.Color(accentColor) },
				theme: { value: theme === 'dark' ? 1 : 0 },
			},
			vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
			fragmentShader: `
      uniform float time;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float theme;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }
      
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      
      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        vec3 pos = vPosition;
        
        float n1 = fbm(pos.xy * 0.5 + time * 0.1);
        float n2 = fbm(pos.yz * 0.5 + time * 0.15);
        float n3 = fbm(pos.zx * 0.5 + time * 0.2);
        
        float pattern = (n1 + n2 + n3) / 3.0;
        pattern = smoothstep(0.3, 0.7, pattern);
        
        vec3 color = mix(color1, color2, pattern);
        float alpha = pattern * 0.15 * (0.7 + 0.3 * sin(time + pos.x + pos.y));
        
        if (theme < 0.5) {
          alpha *= 0.6;
        }
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
		}),
		[primaryColor, accentColor, theme],
	);

	useFrame(state => {
		if (reducedMotion || !materialRef.current) return;
		materialRef.current.uniforms.time.value = state.clock.elapsedTime;
	});

	return (
		<mesh ref={meshRef} position={[0, 0, -15]} scale={[25, 15, 1]}>
			<planeGeometry args={[1, 1, 32, 32]} />
			<shaderMaterial
				ref={materialRef}
				{...shader}
				transparent
				depthWrite={false}
				blending={THREE.AdditiveBlending}
			/>
		</mesh>
	);
});

const DynamicParticles = React.memo(function DynamicParticles({
	count = 200,
	reducedMotion,
}: {
	count: number;
	reducedMotion: boolean;
}) {
	const [particles, setParticles] = useState<Particle[]>(() =>
		generateParticles(count, { x: 25, y: 15, z: 30 }),
	);

	const pointsRef = useRef<ThreePoints>(null);
	const positions = useMemo(() => new Float32Array(count * 3), [count]);
	const sizes = useMemo(() => new Float32Array(count), [count]);
	const colors = useMemo(() => new Float32Array(count * 3), [count]);

	useFrame((state, delta) => {
		if (reducedMotion) return;

		setParticles(prev => {
			const newParticles = [...prev];

			newParticles.forEach((particle, i) => {
				particle.position.add(particle.velocity);

				const bounds = { x: 25, y: 15, z: 30 };
				if (particle.position.x > bounds.x) particle.position.x = -bounds.x;
				else if (particle.position.x < -bounds.x) particle.position.x = bounds.x;
				if (particle.position.y > bounds.y) particle.position.y = -bounds.y;
				else if (particle.position.y < -bounds.y) particle.position.y = bounds.y;
				if (particle.position.z > bounds.z) particle.position.z = -bounds.z;
				else if (particle.position.z < -bounds.z) particle.position.z = bounds.z;

				particle.size =
					particle.originalSize * (1 + 0.2 * Math.sin(state.clock.elapsedTime * 2 + i));

				positions[i * 3] = particle.position.x;
				positions[i * 3 + 1] = particle.position.y;
				positions[i * 3 + 2] = particle.position.z;

				sizes[i] = particle.size;

				const color = new THREE.Color(particle.color);
				colors[i * 3] = color.r * particle.opacity;
				colors[i * 3 + 1] = color.g * particle.opacity;
				colors[i * 3 + 2] = color.b * particle.opacity;
			});

			if (pointsRef.current) {
				pointsRef.current.geometry.attributes.position.needsUpdate = true;
				pointsRef.current.geometry.attributes.size.needsUpdate = true;
				pointsRef.current.geometry.attributes.color.needsUpdate = true;
			}

			return newParticles;
		});
	});

	return (
		<Points ref={pointsRef} positions={positions} sizes={sizes} colors={colors}>
			<PointMaterial
				transparent
				vertexColors
				sizeAttenuation
				depthWrite={false}
				blending={THREE.AdditiveBlending}
			/>
		</Points>
	);
});

const StarField = React.memo(function StarField({ reducedMotion }: { reducedMotion: boolean }) {
	const distantRef = useRef<ThreePoints>(null);
	const mediumRef = useRef<ThreePoints>(null);
	const closeRef = useRef<ThreePoints>(null);

	const { theme } = useTheme();
	const isDark = theme === 'dark';

	const distantStars = useMemo(
		() => generateStarPoints(CONFIG.STARS.DISTANT.count, CONFIG.STARS.DISTANT.radius, 'sphere'),
		[],
	);
	const mediumStars = useMemo(
		() => generateStarPoints(CONFIG.STARS.MEDIUM.count, CONFIG.STARS.MEDIUM.radius, 'galaxy'),
		[],
	);
	const closeStars = useMemo(
		() => generateStarPoints(CONFIG.STARS.CLOSE.count, CONFIG.STARS.CLOSE.radius, 'disc'),
		[],
	);

	useFrame((state, delta) => {
		if (reducedMotion) return;

		if (distantRef.current)
			distantRef.current.rotation.y += delta * CONFIG.STARS.DISTANT.rotationSpeed;
		if (mediumRef.current) {
			mediumRef.current.rotation.y += delta * CONFIG.STARS.MEDIUM.rotationSpeed;
			mediumRef.current.rotation.x += delta * 0.003;
		}
		if (closeRef.current) {
			closeRef.current.rotation.y += delta * CONFIG.STARS.CLOSE.rotationSpeed;
			closeRef.current.rotation.z += delta * 0.005;
		}
	});

	return (
		<group>
			<Points
				ref={distantRef}
				positions={distantStars.positions}
				colors={distantStars.colors}
			>
				<PointMaterial
					transparent
					vertexColors
					size={CONFIG.STARS.DISTANT.size}
					sizeAttenuation
					depthWrite={false}
					opacity={CONFIG.STARS.DISTANT.opacity}
					blending={THREE.AdditiveBlending}
				/>
			</Points>
			<Points ref={mediumRef} positions={mediumStars.positions}>
				<PointMaterial
					transparent
					color={isDark ? '#c7d2fe' : '#312e81'}
					size={CONFIG.STARS.MEDIUM.size}
					sizeAttenuation
					depthWrite={false}
					opacity={CONFIG.STARS.MEDIUM.opacity}
					blending={THREE.AdditiveBlending}
				/>
			</Points>
			<Points ref={closeRef} positions={closeStars.positions}>
				<PointMaterial
					transparent
					color={isDark ? '#ffffff' : '#000000'}
					size={CONFIG.STARS.CLOSE.size}
					sizeAttenuation
					depthWrite={false}
					opacity={CONFIG.STARS.CLOSE.opacity}
					blending={THREE.AdditiveBlending}
				/>
			</Points>
		</group>
	);
});

const CelestialBody = React.memo(function CelestialBody({
	position,
	size,
	color,
	reducedMotion,
}: {
	position: [number, number, number];
	size: number;
	color: string;
	reducedMotion: boolean;
}) {
	const ref = useRef<THREE.Mesh>(null);

	useFrame(state => {
		if (reducedMotion || !ref.current) return;
		ref.current.rotation.y = state.clock.elapsedTime * 0.1;
	});

	return (
		<Float speed={2} rotationIntensity={1} floatIntensity={2}>
			<mesh ref={ref} position={position}>
				<sphereGeometry args={[size, 32, 32]} />
				<meshBasicMaterial
					color={color}
					transparent
					opacity={0.7}
					depthWrite={false}
					blending={THREE.AdditiveBlending}
				/>
			</mesh>
		</Float>
	);
});

const CameraRig = React.memo(function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
	const { camera } = useThree();
	const targetPosition = useRef(new THREE.Vector3(0, 2, 5));

	useFrame(state => {
		if (reducedMotion) return;

		const drift = {
			x: Math.sin(state.clock.elapsedTime * 0.1) * 0.3,
			y: Math.cos(state.clock.elapsedTime * 0.15) * 0.2,
			z: Math.sin(state.clock.elapsedTime * 0.2) * 0.1,
		};

		const mouseX = state.pointer.x * 2 + drift.x;
		const mouseY = state.pointer.y * 1.2 + drift.y;

		targetPosition.current.x += (mouseX - targetPosition.current.x) * 0.02;
		targetPosition.current.y += (1 - mouseY - targetPosition.current.y) * 0.02;
		targetPosition.current.z = 5 + drift.z;

		camera.position.lerp(targetPosition.current, 0.05);

		const targetRotZ = -state.pointer.x * 0.03;
		const newRotZ = camera.rotation.z + (targetRotZ - camera.rotation.z) * 0.02;
		camera.rotation.set(camera.rotation.x, camera.rotation.y, newRotZ);

		camera.lookAt(...CONFIG.CAMERA.lookAt);
	});

	return null;
});

const PostProcessingEffects = React.memo(function PostProcessingEffects() {
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	return (
		<EffectComposer>
			<Bloom
				intensity={isDark ? 1.2 : 0.6}
				luminanceThreshold={0.4}
				luminanceSmoothing={0.9}
				height={300}
			/>
			<Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
			<Vignette darkness={isDark ? 0.4 : 0.2} offset={0.3} />
		</EffectComposer>
	);
});

// --- Main Component ---

export function Background3D({ showPerf = false }: { showPerf?: boolean }) {
	const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, 1.5));
	const reducedMotion = usePrefersReducedMotion();
	const { theme } = useTheme();
	const [hasWebGLError, setHasWebGLError] = useState(false);

	// Responsive DPR
	useEffect(() => {
		const handleResize = () => setDpr(Math.min(window.devicePixelRatio || 1, 1.5));
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// WebGL check
	useEffect(() => {
		try {
			const canvas = document.createElement('canvas');
			const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
			if (!gl) queueMicrotask(() => setHasWebGLError(true));
		} catch {
			queueMicrotask(() => setHasWebGLError(true));
		}
	}, []);

	if (hasWebGLError || typeof window === 'undefined') return null;

	return (
		<div
			className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ease-in-out overflow-hidden"
			aria-hidden="true"
		>
			<ErrorBoundary>
				<Canvas
					dpr={dpr}
					frameloop={reducedMotion ? 'demand' : 'always'}
					camera={{ position: [0, 2, 5], fov: 75, near: 0.1, far: 200 }}
					gl={{
						antialias: true,
						alpha: true,
						powerPreference: 'high-performance',
						logarithmicDepthBuffer: true,
					}}
					onCreated={({ gl }) => {
						gl.setClearAlpha(0);
						gl.setClearColor('#000000', 0);
					}}
					shadows={false}
				>
					{showPerf && <Perf position="top-left" />}
					<color attach="background" args={[theme === 'dark' ? '#000000' : '#ffffff']} />
					<CameraRig reducedMotion={reducedMotion} />
					<fog attach="fog" args={[theme === 'dark' ? '#000000' : '#ffffff', 30, 100]} />
					<NebulaField reducedMotion={reducedMotion} />
					<StarField reducedMotion={reducedMotion} />
					<ConstellationLines />
					<CelestialBody
						position={[10, 3, -20]}
						size={0.8}
						color="#fbbf24"
						reducedMotion={reducedMotion}
					/>
					<CelestialBody
						position={[-12, -2, -25]}
						size={0.5}
						color="#60a5fa"
						reducedMotion={reducedMotion}
					/>
					<DynamicParticles
						count={CONFIG.PARTICLES.count}
						reducedMotion={reducedMotion}
					/>
					<ShootingStars
						count={CONFIG.SHOOTING_STARS.count}
						reducedMotion={reducedMotion}
					/>
					<PostProcessingEffects />
				</Canvas>
			</ErrorBoundary>
			{/* Overlay gradient for depth */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent dark:via-black/20 dark:to-black/40" />
				<div className="absolute inset-0 bg-gradient-radial from-transparent to-transparent dark:to-black/30" />
			</div>
		</div>
	);
}

// Simple fallback for low-end devices
export function SimpleBackground3D() {
	const [dpr, setDpr] = useState(() =>
		Math.min(window.devicePixelRatio || 1, CONFIG.PERFORMANCE.simpleDPR),
	);
	const reducedMotion = usePrefersReducedMotion();
	const [hasWebGLError, setHasWebGLError] = useState(false);

	useEffect(() => {
		const handleResize = () =>
			setDpr(Math.min(window.devicePixelRatio || 1, CONFIG.PERFORMANCE.simpleDPR));
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		try {
			const canvas = document.createElement('canvas');
			const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
			if (!gl) queueMicrotask(() => setHasWebGLError(true));
		} catch {
			queueMicrotask(() => setHasWebGLError(true));
		}
	}, []);

	if (hasWebGLError) return null;

	return (
		<div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
			<Canvas
				dpr={dpr}
				frameloop={reducedMotion ? 'demand' : 'always'}
				camera={{ position: [0, 0, 5], fov: 75 }}
				gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
			>
				<StarField reducedMotion={reducedMotion} />
				<CameraRig reducedMotion={reducedMotion} />
			</Canvas>
		</div>
	);
}
