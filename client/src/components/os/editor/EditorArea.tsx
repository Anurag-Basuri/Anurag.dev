'use client';

import { useAtom } from 'jotai';
import { windowsAtom } from '@/store/atoms';
import { WindowFrame } from './WindowFrame';

export function EditorArea() {
	const [windows] = useAtom(windowsAtom);

	return (
		<div id="editor-boundary" className="h-full w-full relative">
			{windows.map(window => (
				<WindowFrame key={window.id} windowState={window} bounds="#editor-boundary" />
			))}
		</div>
	);
}
