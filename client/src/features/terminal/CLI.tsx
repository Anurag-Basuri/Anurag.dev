'use client';

import { forwardRef, useEffect, useRef, memo, useCallback } from 'react';
import { useTerminalState } from './hooks/useTerminalState';
import { useCLI } from './hooks/useCLI';
import { Terminal, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PanelHeader } from '@/components/layout/PanelHeader';
import { TerminalControls } from '@/components/common/WindowControls';
import type { HistoryItem } from './types';
import { usePanelControls } from '@/contexts/panel-context';

// ============================================================================
// Constants
// ============================================================================

const STYLES = {
	bar: 'h-9 px-3 bg-white/5 backdrop-blur-md border-white/5 flex items-center shrink-0',
	icon: 'w-3.5 h-3.5 shrink-0',
	text: 'text-xs font-mono',
} as const;

// ============================================================================
// Input Component
// ============================================================================

const Input = forwardRef<
	HTMLInputElement,
	{
		value: string;
		path: string;
		cursorPos: number;
		isFocused: boolean;
		isExecuting: boolean;
		onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
		onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
		onFocus: () => void;
		onBlur: () => void;
	}
>(
	(
		{ value, path, cursorPos, isFocused, isExecuting, onChange, onKeyDown, onFocus, onBlur },
		ref,
	) => (
		<div
			className={cn(
				STYLES.bar,
				'border-t gap-1.5 sm:gap-2 cursor-text transition-all duration-300',
				isFocused
					? 'border-emerald-500/40 bg-zinc-900/80 ring-1 ring-emerald-500/20 shadow-[0_0_12px_rgba(52,211,153,0.1)]'
					: 'border-white/5 hover:border-white/10 hover:bg-zinc-900/40',
				isExecuting && 'opacity-60 pointer-events-none',
			)}
			onClick={() => (ref as React.RefObject<HTMLInputElement>)?.current?.focus()}
		>
			<ChevronRight
				className={cn(
					STYLES.icon,
					'transition-colors duration-200',
					isFocused ? 'text-emerald-400' : 'text-white/30',
				)}
			/>
			<span
				className={cn(
					STYLES.text,
					'font-semibold transition-colors duration-200 hidden sm:inline',
					isFocused ? 'text-emerald-400' : 'text-white/40',
				)}
			>
				{path}
			</span>
			<span
				className={cn(
					STYLES.text,
					'font-bold transition-colors duration-200',
					isFocused ? 'text-emerald-500' : 'text-white/20',
				)}
			>
				$
			</span>
			<div className="relative flex-1 min-w-0 flex items-center">
				<input
					ref={ref}
					type="text"
					value={value}
					onChange={onChange}
					onKeyDown={onKeyDown}
					onFocus={onFocus}
					onBlur={onBlur}
					disabled={isExecuting}
					className="absolute inset-0 w-full bg-transparent text-transparent caret-transparent outline-none font-mono text-xs"
					autoComplete="off"
					autoCorrect="off"
					autoCapitalize="off"
					spellCheck={false}
					aria-label="Command input"
					enterKeyHint="send"
				/>
				<div
					className={cn(
						STYLES.text,
						'whitespace-pre pointer-events-none flex items-center transition-colors duration-200',
						isFocused ? 'text-white' : 'text-white/60',
					)}
				>
					<span>{value.slice(0, cursorPos)}</span>
					<span
						className={cn(
							'inline-block w-[2px] h-[14px] bg-emerald-400 rounded-sm',
							isFocused
								? 'animate-[cursor-blink_1s_ease-in-out_infinite]'
								: 'opacity-0',
						)}
					/>
					<span className="text-white/40">{value.slice(cursorPos)}</span>
				</div>
			</div>
		</div>
	),
);
Input.displayName = 'Input';

// ============================================================================
// Suggestions Component
// ============================================================================

const Suggestions = memo(
	({
		items,
		activeIndex,
		onSelect,
		onHover,
	}: {
		items: string[];
		activeIndex: number;
		onSelect: (s: string) => void;
		onHover: (i: number) => void;
	}) => {
		if (!items.length) return null;
		return (
			<div
				className={cn(
					STYLES.bar,
					'border-t gap-1.5 sm:gap-2 flex-wrap h-auto py-1.5 sm:py-2 animate-in fade-in slide-in-from-bottom-1 duration-150',
				)}
			>
				<span className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest flex items-center gap-1">
					<span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500/50" />
					<span className="hidden sm:inline">Tab</span>
				</span>
				{items.map((s, i) => (
					<button
						key={s}
						onClick={() => onSelect(s)}
						onMouseEnter={() => onHover(i)}
						className={cn(
							'px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-mono transition-all duration-150 active:scale-95',
							i === activeIndex
								? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
								: 'bg-white/5 text-white/60 border border-transparent hover:bg-white/10 hover:text-white',
						)}
					>
						{s}
					</button>
				))}
			</div>
		);
	},
);
Suggestions.displayName = 'Suggestions';

// ============================================================================
// Output Components
// ============================================================================

const HistoryEntry = memo(({ item, isNew }: { item: HistoryItem; isNew?: boolean }) => (
	<div
		className={cn(
			'space-y-1.5 py-1',
			'border-l-2 border-transparent hover:border-emerald-500/20 pl-2 -ml-2',
			'transition-all duration-200',
			isNew && 'animate-in fade-in slide-in-from-bottom-2',
		)}
	>
		{item.command && (
			<div className="flex items-start gap-1.5 sm:gap-2 text-xs font-mono">
				<ChevronRight className="w-3 h-3 text-emerald-500/60 shrink-0 mt-0.5" />
				<span className="text-white/35 truncate max-w-[80px] sm:max-w-none">
					{item.path}
				</span>
				<span className="text-emerald-500/60">$</span>
				<span className="text-white/90 break-all font-medium">{item.command}</span>
			</div>
		)}
		{item.response.content && (
			<div
				className={cn(
					'text-xs font-mono pl-4 sm:pl-5 whitespace-pre-wrap wrap-break-word leading-relaxed',
					item.response.type === 'error'
						? 'text-red-400/90 bg-red-500/5 rounded px-2 py-1 -ml-2'
						: item.response.type === 'success'
						? 'text-emerald-400/80'
						: 'text-white/55',
				)}
			>
				{item.response.content}
			</div>
		)}
	</div>
));
HistoryEntry.displayName = 'HistoryEntry';

const Welcome = memo(() => (
	<div className="text-xs font-mono space-y-3 animate-in fade-in duration-700">
		<div className="flex items-center gap-2">
			<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
			<p className="text-white/50">
				Welcome! Type <span className="text-emerald-400 font-semibold">help</span> for
				available commands.
			</p>
		</div>
		<div className="flex flex-wrap gap-3 text-[10px] text-white/30">
			<kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">
				<span className="text-emerald-500/70">↑↓</span> History
			</kbd>
			<kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">
				<span className="text-emerald-500/70">Tab</span> Complete
			</kbd>
			<kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">
				<span className="text-emerald-500/70">Ctrl+L</span> Clear
			</kbd>
		</div>
	</div>
));
Welcome.displayName = 'Welcome';

// ============================================================================
// Main CLI Component
// ============================================================================

export function CLI() {
	const { terminal } = usePanelControls();
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

	// Auto-focus input on mount and when expanding
	useEffect(() => {
		if (!terminal.isCollapsed) {
			// Small delay to ensure DOM is ready
			const timer = setTimeout(() => inputRef.current?.focus(), 100);
			return () => clearTimeout(timer);
		}
	}, [terminal.isCollapsed]);

	// Handle container click to focus input
	const handleContainerClick = useCallback((e: React.MouseEvent) => {
		// Only focus if clicking on the scroll area (not buttons/suggestions)
		if (e.target === scrollRef.current || scrollRef.current?.contains(e.target as Node)) {
			inputRef.current?.focus();
		}
	}, []);

	// Collapsed state
	if (terminal.isCollapsed) {
		return (
			<button
				onClick={terminal.expand}
				className="collapsed-panel-btn h-full w-full flex items-center justify-center bg-transparent cursor-pointer group"
				aria-label="Expand terminal"
			>
				{/* Horizontal content container */}
				<div className="flex items-center gap-4">
					{/* Left line with shimmer */}
					<div className="collapsed-line-shimmer h-px w-8 rounded-full" />

					{/* Icon with pulse */}
					<Terminal className="collapsed-icon-pulse w-4 h-4 text-white/30 group-hover:text-emerald-400 transition-colors duration-300" />

					{/* Text */}
					<span className="text-xs font-mono tracking-widest text-white/30 group-hover:text-white/70 transition-colors duration-300 uppercase">
						Terminal
					</span>

					{/* Right line with shimmer */}
					<div className="collapsed-line-shimmer h-px w-8 rounded-full" />
				</div>
			</button>
		);
	}

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
				controls={
					<TerminalControls
						onClose={terminal.collapse}
						onClearHistory={state.clearHistory}
						onMaximize={terminal.toggleMaximize}
						isMaximized={terminal.isMaximized}
					/>
				}
			/>

			<div
				ref={scrollRef}
				className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 space-y-2"
				style={{
					scrollbarWidth: 'thin',
					scrollbarColor: 'rgba(255,255,255,0.1) transparent',
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

			<Input
				ref={inputRef}
				value={state.input}
				path={state.currentPath}
				cursorPos={state.cursorPos}
				isFocused={state.isFocused}
				isExecuting={state.isExecuting}
				onChange={e => {
					state.setInput(e.target.value);
					state.setCursorPos(e.target.selectionStart || 0);
					state.setActiveSuggestionIndex(0);
					state.setHistoryIndex(-1);
				}}
				onKeyDown={handleKeyDown}
				onFocus={() => state.setIsFocused(true)}
				onBlur={() => state.setIsFocused(false)}
			/>
		</div>
	);
}
