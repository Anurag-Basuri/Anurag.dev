'use client';

import { useAtomValue } from 'jotai';
import { backgroundModeAtom } from './background';
import { Scene3D } from './Scene3D';
import { StarfieldWarp } from './StarfieldWarp';
import { TechGrid } from './TechGrid';

export function BackgroundRenderer() {
	const mode = useAtomValue(backgroundModeAtom);

	if (mode === 'none') return null;
	if (mode === 'particles_wireframe') return <Scene3D />;
	if (mode === 'starfield_warp') return <StarfieldWarp />;
	if (mode === 'tech_grid') return <TechGrid />;

	return null;
}

