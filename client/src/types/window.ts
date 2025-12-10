import { ReactNode } from 'react';

export interface WindowState {
	id: string;
	title: string;
	component: ReactNode;
	isOpen: boolean;
	isMinimized: boolean;
	isMaximized?: boolean;
	isLoading?: boolean;
	position?: { x: number; y: number };
	size?: { width: number | string; height: number | string };
	zIndex?: number;
}
