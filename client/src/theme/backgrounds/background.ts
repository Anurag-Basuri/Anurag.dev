import { atomWithStorage } from 'jotai/utils';

export type BackgroundMode = 'none' | 'particles_wireframe' | 'starfield_warp' | 'tech_grid';

export const backgroundModeAtom = atomWithStorage<BackgroundMode>(
	'portfolio_background_mode',
	'particles_wireframe',
);

