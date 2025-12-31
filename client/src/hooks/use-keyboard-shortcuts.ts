import { useEffect } from 'react';

export type Shortcut = {
	key: string;
	ctrl?: boolean;
	shift?: boolean;
	alt?: boolean;
	meta?: boolean;
	handler: () => void;
	description?: string;
};

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			for (const shortcut of shortcuts) {
				const { key, ctrl, shift, alt, meta, handler } = shortcut;

				if (
					event.key.toLowerCase() === key.toLowerCase() &&
					!!event.ctrlKey === !!ctrl &&
					!!event.shiftKey === !!shift &&
					!!event.altKey === !!alt &&
					!!event.metaKey === !!meta
				) {
					event.preventDefault();
					handler();
					return;
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown, { capture: true });
		return () => window.removeEventListener('keydown', handleKeyDown, { capture: true } as any);
	}, [shortcuts]);
}
