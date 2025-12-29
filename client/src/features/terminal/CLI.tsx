'use client';

import { forwardRef, useEffect, useRef, memo, useCallback } from 'react';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { useTerminalState } from './hooks/useTerminalState';
import { useCLI } from './hooks/useCLI';
import { Terminal, ChevronRight, Trash2, Maximize2, Minus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HistoryItem } from './types';

// ============================================================================
// Constants
// ============================================================================

const STYLES = {
	bar: 'min-h-[2rem] px-2 sm:px-3 bg-zinc-900/95 backdrop-blur-md border-white/5 flex items-center shrink-0',
	icon: 'w-3.5 h-3.5 shrink-0',
	text: 'text-xs font-mono',
} as const;

// ============================================================================
// Header Component
// ============================================================================

const Header = memo(
	({
		path,
		isFocused,
		isExecuting,
		onClear,
		onMinimize,
		onMaximize,
	}: {
		path: string;
		isFocused: boolean;
		isExecuting: boolean;
		onClear: () => void;
		onMinimize: () => void;
		onMaximize: () => void;
	}) => (
		<header className={cn(STYLES.bar, 'border-b justify-between gap-2 sm:gap-4')}>
			<div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
				{isExecuting ? (
					<Loader2 className={cn(STYLES.icon, 'text-emerald-400 animate-spin')} />
				) : (
					<Terminal
						className={cn(
							STYLES.icon,
							'transition-colors duration-200',
							isFocused ? 'text-emerald-400' : 'text-white/40',
						)}
					/>
				)}
				<span
					className={cn(
						STYLES.text,
						'font-semibold tracking-tight transition-colors duration-200 hidden sm:inline',
						isFocused ? 'text-emerald-300' : 'text-white/60',
					)}
				>
					TERMINAL
				</span>
				<span className="text-white/20 hidden sm:inline">—</span>
				<span
					className={cn(
						STYLES.text,
						'truncate transition-colors duration-200',
						isFocused ? 'text-emerald-200/80' : 'text-white/40',
					)}
				>
					{path}
				</span>
			</div>
			<div className="flex items-center gap-0.5 sm:gap-1">
				<button
					onClick={onClear}
					className="p-1.5 sm:p-2 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-all duration-150 active:scale-95"
					title="Clear (Ctrl+L)"
					aria-label="Clear terminal"
				>
					<Trash2 className="w-3.5 h-3.5" />
				</button>
				<button
					onClick={onMaximize}
					className="p-1.5 sm:p-2 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-all duration-150 active:scale-95 hidden sm:flex"
					title="Maximize"
					aria-label="Maximize terminal"
				>
					<Maximize2 className="w-3.5 h-3.5" />
				</button>
				<button
					onClick={onMinimize}
					className="p-1.5 sm:p-2 rounded-md hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all duration-150 active:scale-95"
					title="Minimize"
					aria-label="Minimize terminal"
				>
					<Minus className="w-3.5 h-3.5" />
				</button>
			</div>
		</header>
	),
);
Header.displayName = 'Header';

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
				'border-t gap-1.5 sm:gap-2 cursor-text transition-all duration-200',
				isFocused ? 'border-emerald-500/30 bg-zinc-900' : 'border-white/5',
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
							'w-0.5 h-4 bg-emerald-400 transition-opacity duration-100',
							isFocused ? 'animate-pulse' : 'opacity-0',
						)}
					/>
					<span className="opacity-50">{value.slice(cursorPos)}</span>
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
			'space-y-1 transition-all duration-300',
			isNew && 'animate-in fade-in slide-in-from-bottom-2',
		)}
	>
		{item.command && (
			<div className="flex items-start gap-1.5 sm:gap-2 text-xs font-mono">
				<ChevronRight className="w-3 h-3 text-emerald-500/50 shrink-0 mt-0.5" />
				<span className="text-white/40 truncate max-w-[80px] sm:max-w-none">
					{item.path}
				</span>
				<span className="text-emerald-500/50">$</span>
				<span className="text-white/80 break-all">{item.command}</span>
			</div>
		)}
		{item.response.content && (
			<div
				className={cn(
					'text-xs font-mono pl-4 sm:pl-5 whitespace-pre-wrap wrap-break-word',
					item.response.type === 'error' ? 'text-red-400/80' : 'text-white/60',
				)}
			>
				{item.response.content}
			</div>
		)}
	</div>
));
HistoryEntry.displayName = 'HistoryEntry';

const Welcome = memo(() => (
	<div className="text-xs font-mono text-white/30 space-y-2 animate-in fade-in duration-500">
		<p>
			Welcome! Type <span className="text-emerald-400">help</span> for commands.
		</p>
		<div className="text-white/20 text-[10px] space-y-0.5">
			<p className="flex flex-wrap gap-x-2 gap-y-0.5">
				<span>
					<span className="text-emerald-500/50">↑/↓</span> History
				</span>
				<span className="hidden sm:inline">•</span>
				<span>
					<span className="text-emerald-500/50">Tab</span> Autocomplete
				</span>
				<span className="hidden sm:inline">•</span>
				<span>
					<span className="text-emerald-500/50">Ctrl+L</span> Clear
				</span>
			</p>
		</div>
	</div>
));
Welcome.displayName = 'Welcome';

// ============================================================================
// Main CLI Component
// ============================================================================

export function CLI() {
	const terminal = useCollapsiblePanel({ type: 'terminal' });
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
				className="h-full w-full flex items-center justify-center gap-2 bg-zinc-900/50 hover:bg-zinc-900/70 transition-all duration-200 group active:scale-[0.98]"
				aria-label="Expand terminal"
			>
				<Terminal className="w-4 h-4 text-white/30 group-hover:text-emerald-400 transition-colors duration-200" />
				<span className="text-xs font-mono text-white/30 group-hover:text-white/60 transition-colors duration-200">
					Terminal
				</span>
			</button>
		);
	}

	return (
		<div
			className="h-full flex flex-col bg-black/20 overflow-hidden"
			onClick={handleContainerClick}
		>
			<Header
				path={state.currentPath}
				isFocused={state.isFocused}
				isExecuting={state.isExecuting}
				onClear={state.clearHistory}
				onMinimize={terminal.collapse}
				onMaximize={terminal.maximize}
			/>

			<div
				ref={scrollRef}
				className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 sm:p-3 space-y-2 sm:space-y-3"
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
