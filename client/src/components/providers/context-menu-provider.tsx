'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface ContextMenuContextType {
	showMenu: (x: number, y: number, type?: string, data?: unknown) => void;
	hideMenu: () => void;
	isOpen: boolean;
	position: { x: number; y: number };
	type: string;
	data: unknown;
}

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

export function useContextMenu() {
	const context = useContext(ContextMenuContext);
	if (!context) {
		throw new Error('useContextMenu must be used within a ContextMenuProvider');
	}
	return context;
}

interface ContextMenuProviderProps {
	children: React.ReactNode;
}

export function ContextMenuProvider({ children }: ContextMenuProviderProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [type, setType] = useState('desktop');
	const [data, setData] = useState<unknown>(null);

	const showMenu = useCallback(
		(x: number, y: number, menuType = 'desktop', menuData: unknown = null) => {
			// Adjust position if close to edge (basic implementation)
			// We'll let the component handle detailed edge detection if needed,
			// but basic clamping here is good practice.
			setPosition({ x, y });
			setType(menuType);
			setData(menuData);
			setIsOpen(true);
		},
		[],
	);

	const hideMenu = useCallback(() => {
		setIsOpen(false);
	}, []);

	// distinct click handler to close menu
	useEffect(() => {
		const handleClick = () => {
			if (isOpen) hideMenu();
		};

		const handleScroll = () => {
			if (isOpen) hideMenu();
		};

		const handleResize = () => {
			if (isOpen) hideMenu();
		};

		window.addEventListener('click', handleClick);
		window.addEventListener('scroll', handleScroll, true); // Capture scroll events from any element
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('click', handleClick);
			window.removeEventListener('scroll', handleScroll, true);
			window.removeEventListener('resize', handleResize);
		};
	}, [isOpen, hideMenu]);

	return (
		<ContextMenuContext.Provider value={{ showMenu, hideMenu, isOpen, position, type, data }}>
			{children}
		</ContextMenuContext.Provider>
	);
}
