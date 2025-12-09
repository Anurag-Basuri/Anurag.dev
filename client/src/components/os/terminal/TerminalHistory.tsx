'use client';

import { useRef, useEffect } from 'react';
import { TerminalOutput } from './TerminalOutput';
import { TerminalWelcome } from './TerminalWelcome';
import type { HistoryItem } from './types';

interface TerminalHistoryProps {
	history: HistoryItem[];
}

export function TerminalHistory({ history }: TerminalHistoryProps) {
	const scrollRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom on history change
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [history]);

	return (
		<div
			ref={scrollRef}
			className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth"
			style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
		>
			{history.length === 0 && <TerminalWelcome />}
			<TerminalOutput history={history} />
		</div>
	);
}
