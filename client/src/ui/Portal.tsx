'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders children into document.body via a React portal.
 * This ensures modals sit above ALL layout layers (scroll container, sidebar, topbar)
 * and prevent background content from bleeding through.
 */
export function Portal({ children }: { children: ReactNode }) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		return () => setMounted(false);
	}, []);

	if (!mounted) return null;
	return createPortal(children, document.body);
}
