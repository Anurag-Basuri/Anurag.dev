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

// --- Configuration ---
const CONFIG = {
	STARS: {
		DISTANT: { count: 1000, radius: 100, size: 0.01, opacity: 0.25, rotationSpeed: 0.002 },
		MEDIUM: { count: 500, radius: 50, size: 0.02, opacity: 0.35, rotationSpeed: 0.005 },
		CLOSE: { count: 150, radius: 25, size: 0.04, opacity: 0.5, rotationSpeed: 0.01 },
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

// --- Components ---

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
        
        float n1 = fbm(pos.xy * 0.45 + time * 0.08);
        float n2 = fbm(pos.yz * 0.45 + time * 0.12);
        float n3 = fbm(pos.zx * 0.45 + time * 0.16);
        
        float pattern = (n1 + n2 + n3) / 3.0;
        pattern = smoothstep(0.4, 0.6, pattern);
        
        vec3 color = mix(color1, color2, pattern);
        float alpha = pattern * 0.08 * (0.8 + 0.2 * sin(time * 0.6 + pos.x + pos.y));
        
        if (theme < 0.5) {
          alpha *= 0.4;
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
			mediumRef.current.rotation.x += delta * 0.002;
		}
		if (closeRef.current) {
			closeRef.current.rotation.y += delta * CONFIG.STARS.CLOSE.rotationSpeed;
			closeRef.current.rotation.z += delta * 0.004;
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
					color={isDark ? '#ffffff' : '#1e293b'}
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

const CameraRig = React.memo(function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
	const { camera } = useThree();
	const targetPosition = useRef(new THREE.Vector3(0, 2, 5));

	useFrame(state => {
		if (reducedMotion) return;

		const drift = {
			x: Math.sin(state.clock.elapsedTime * 0.08) * 0.25,
			y: Math.cos(state.clock.elapsedTime * 0.12) * 0.18,
			z: Math.sin(state.clock.elapsedTime * 0.15) * 0.08,
		};

		const mouseX = state.pointer.x * 1.8 + drift.x;
		const mouseY = state.pointer.y * 1.0 + drift.y;

		targetPosition.current.x += (mouseX - targetPosition.current.x) * 0.025;
		targetPosition.current.y += (1 - mouseY - targetPosition.current.y) * 0.025;
		targetPosition.current.z = 5 + drift.z;

		camera.position.lerp(targetPosition.current, 0.06);

		const targetRotZ = -state.pointer.x * 0.025;
		const newRotZ = camera.rotation.z + (targetRotZ - camera.rotation.z) * 0.025;
		camera.rotation.set(camera.rotation.x, camera.rotation.y, newRotZ);

		camera.lookAt(...CONFIG.CAMERA.lookAt);
	});

	return null;
});

const AnimatedGrid = React.memo(function AnimatedGrid({
	reducedMotion,
}: {
	reducedMotion: boolean;
}) {
	const { theme } = useTheme();
	const meshRef = useRef<THREE.Mesh>(null);
	const materialRef = useRef<THREE.ShaderMaterial>(null);

	const gridShader = useMemo(
		() => ({
			uniforms: {
				time: { value: 0 },
				gridColor: { value: new THREE.Color(theme === 'dark' ? '#0ea5e9' : '#94a3b8') },
				fadeColor: { value: new THREE.Color(theme === 'dark' ? '#000000' : '#ffffff') },
				opacity: { value: theme === 'dark' ? 0.18 : 0.08 },
			},
			vertexShader: `
			uniform float time;
			varying vec2 vUv;
			varying float vElevation;
			
			void main() {
				vUv = uv;
				
				vec3 pos = position;
				float wave1 = sin(pos.x * 0.25 + time * 0.4) * cos(pos.y * 0.25 + time * 0.4);
				float wave2 = sin(pos.x * 0.18 - time * 0.25) * sin(pos.y * 0.18 + time * 0.35);
				
				float elevation = (wave1 + wave2) * 0.4;
				pos.z += elevation;
				
				vElevation = elevation;
				
				gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
			}
		`,
			fragmentShader: `
			uniform vec3 gridColor;
			uniform vec3 fadeColor;
			uniform float opacity;
			varying vec2 vUv;
			varying float vElevation;
			
			void main() {
				// Grid lines
				vec2 grid = abs(fract(vUv * 20.0 - 0.5) - 0.5) / fwidth(vUv * 20.0);
				float line = min(grid.x, grid.y);
				float gridPattern = 1.0 - min(line, 1.0);
				
				// Distance fade
				float dist = length(vUv - 0.5) * 2.0;
				float fade = 1.0 - smoothstep(0.3, 1.0, dist);
				
				// Elevation glow
				float elevationGlow = abs(vElevation) * 0.5;
				
				vec3 color = mix(fadeColor, gridColor, gridPattern + elevationGlow);
				float alpha = gridPattern * fade * opacity;
				
				gl_FragColor = vec4(color, alpha);
			}
		`,
		}),
		[theme],
	);

	useFrame(state => {
		if (reducedMotion || !materialRef.current) return;
		materialRef.current.uniforms.time.value = state.clock.elapsedTime;
	});

	return (
		<mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
			<planeGeometry args={[100, 100, 50, 50]} />
			<shaderMaterial
				ref={materialRef}
				{...gridShader}
				transparent
				depthWrite={false}
				blending={THREE.AdditiveBlending}
			/>
		</mesh>
	);
});

const PostProcessingEffects = React.memo(function PostProcessingEffects() {
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	return (
		<EffectComposer>
			<Bloom
				intensity={isDark ? 0.6 : 0.3}
				luminanceThreshold={0.6}
				luminanceSmoothing={0.8}
				height={300}
			/>
			<Noise opacity={0.01} blendFunction={BlendFunction.OVERLAY} />
			<Vignette darkness={isDark ? 0.25 : 0.12} offset={0.4} />
		</EffectComposer>
	);
});

// --- Main Component ---

export function Background3D() {
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
					<color attach="background" args={[theme === 'dark' ? '#000000' : '#f8f9fa']} />
					<CameraRig reducedMotion={reducedMotion} />
					<fog attach="fog" args={[theme === 'dark' ? '#000000' : '#ffffff', 30, 100]} />
					<AnimatedGrid reducedMotion={reducedMotion} />
					<NebulaField reducedMotion={reducedMotion} />
					<StarField reducedMotion={reducedMotion} />
					<PostProcessingEffects />
				</Canvas>
			</ErrorBoundary>
		</div>
	);
}
