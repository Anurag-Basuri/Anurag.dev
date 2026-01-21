'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTerminalState } from './hooks/useTerminalState';
import { useCLI } from './hooks/useCLI';
import { Terminal } from 'lucide-react';
import { PanelHeader } from '@/components/layout/PanelHeader';
import { TerminalControls } from '@/components/common/WindowControls';
import { TerminalInput, Suggestions, HistoryEntry, Welcome } from './components';

// ============================================================================
// Main CLI Component
// ============================================================================

export function CLI() {
	const state = useTerminalState();
	const { handleKeyDown } = useCLI(state);
	const inputRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const historyLengthRef = useRef(0);

	// Smooth auto-scroll on history change
	useEffect(() => {
		if (scrollRef.current && state.history.length > historyLengthRef.current) {
			scrollRef.current.scrollTo({
				top: scrollRef.current.scrollHeight,
				behavior: 'smooth',
			});
		}
		historyLengthRef.current = state.history.length;
	}, [state.history.length]);

	// Auto-focus input on mount
	useEffect(() => {
		const timer = setTimeout(() => inputRef.current?.focus(), 100);
		return () => clearTimeout(timer);
	}, []);

	// Handle container click to focus input
	const handleContainerClick = useCallback((e: React.MouseEvent) => {
		if (e.target === scrollRef.current || scrollRef.current?.contains(e.target as Node)) {
			inputRef.current?.focus();
		}
	}, []);

	// Handle input change
	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			state.setInput(e.target.value);
			state.setCursorPos(e.target.selectionStart || 0);
			state.setActiveSuggestionIndex(0);
			state.setHistoryIndex(-1);
		},
		[state],
	);

	// Handle focus/blur
	const handleFocus = useCallback(() => state.setIsFocused(true), [state]);
	const handleBlur = useCallback(() => state.setIsFocused(false), [state]);

	return (
		<div
			className="h-full flex flex-col bg-transparent overflow-hidden"
			onClick={handleContainerClick}
		>
			<PanelHeader
				type="terminal"
				icon={Terminal}
				title="TERMINAL"
				subtitle={state.currentPath}
				isFocused={state.isFocused}
				controls={<TerminalControls onClearHistory={state.clearHistory} />}
			/>

			<div
				ref={scrollRef}
				className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 space-y-2 will-change-scroll"
				style={{
					scrollbarWidth: 'thin',
					scrollbarColor: 'var(--muted-foreground) transparent',
				}}
				role="log"
				aria-live="polite"
				aria-label="Terminal output"
			>
				{state.history.length === 0 && <Welcome />}
				{state.history.map((item, i) => (
					<HistoryEntry
						key={item.id}
						item={item}
						isNew={i === state.history.length - 1}
					/>
				))}
			</div>

			{state.showSuggestions && (
				<Suggestions
					items={state.suggestions}
					activeIndex={state.activeSuggestionIndex}
					onSelect={state.applySuggestion}
					onHover={state.setActiveSuggestionIndex}
				/>
			)}

			<TerminalInput
				ref={inputRef}
				value={state.input}
				path={state.currentPath}
				cursorPos={state.cursorPos}
				isFocused={state.isFocused}
				isExecuting={state.isExecuting}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>
		</div>
	);
}
