import { ReactNode } from 'react';

export type WindowState = {
	id: string;
	title: string;
	component: ReactNode;
	isOpen: boolean;
	isMinimized: boolean;
	position?: { x: number; y: number };
	size?: { width: number; height: number };
};
