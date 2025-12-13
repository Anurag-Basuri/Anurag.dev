'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Hook to get the computed value of a CSS variable.
 * Useful for bridging CSS theme variables into Canvas/JS-only components.
 */
export function useThemeColor(variableName: string, fallback: string = '#ffffff') {
	const { theme, resolvedTheme } = useTheme();
	const [color, setColor] = useState(fallback);

	useEffect(() => {
		// Function to update color from computed style
		const updateColor = () => {
			const root = document.documentElement;
			const value = getComputedStyle(root).getPropertyValue(variableName).trim();
			// If the variable is not set, use fallback
			if (!value) return;

			// Check if it's already a valid color string for Three.js (e.g. hex, rgb, hsl)
			// or if it is oklch which Three.js supports via browser canvas parsing (mostly).
			// If we run into issues, we might need a canvas-based converter,
			// but for now let's pass the raw string.
			setColor(value);
		};

		updateColor();

		// Create a mutation observer to watch for class changes on html/body (for theme switches)
		const observer = new MutationObserver(updateColor);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class', 'style'],
		});

		return () => observer.disconnect();
	}, [variableName, theme, resolvedTheme]);

	return color;
}
