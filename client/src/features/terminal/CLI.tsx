'use client';

import { forwardRef, useEffect, useRef } from 'react';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { useTerminalState } from './hooks/useTerminalState';
import { useCLI } from './hooks/useCLI';
import { Terminal, ChevronRight, Trash2, Maximize2, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HistoryItem } from './types';

// ============================================================================
// Constants
// ============================================================================

const STYLES = {
	bar: 'h-8 px-3 bg-zinc-900/95 backdrop-blur-md border-white/5 flex items-center shrink-0',
	icon: 'w-3.5 h-3.5',
	text: 'text-xs font-mono',
} as const;

// ============================================================================
// Header Component
// ============================================================================

const Header = ({
	path,
	isFocused,
	onClear,
	onMinimize,
	onMaximize,
}: {
	path: string;
	isFocused: boolean;
	onClear: () => void;
	onMinimize: () => void;
	onMaximize: () => void;
}) => (
	<header className={cn(STYLES.bar, 'border-b justify-between gap-4')}>
		<div className="flex items-center gap-2">
			<Terminal
				className={cn(STYLES.icon, isFocused ? 'text-emerald-400' : 'text-white/40')}
			/>
			<span
				className={cn(
					STYLES.text,
					'font-semibold tracking-tight',
					isFocused ? 'text-emerald-300' : 'text-white/60',
				)}
			>
				TERMINAL
			</span>
			<span className="text-white/20">—</span>
			<span className={cn(STYLES.text, isFocused ? 'text-emerald-200/80' : 'text-white/40')}>
				{path}
			</span>
		</div>
		<div className="flex items-center gap-1">
			<button
				onClick={onClear}
				className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
				title="Clear"
			>
				<Trash2 className="w-3 h-3" />
			</button>
			<button
				onClick={onMaximize}
				className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
				title="Maximize"
			>
				<Maximize2 className="w-3 h-3" />
			</button>
			<button
				onClick={onMinimize}
				className="p-1.5 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
				title="Minimize"
			>
				<Minus className="w-3 h-3" />
			</button>
		</div>
	</header>
);

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
		onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
		onKeyDown: (e: React.KeyboardEvent) => void;
		onFocus: () => void;
		onBlur: () => void;
	}
>(({ value, path, cursorPos, isFocused, onChange, onKeyDown, onFocus, onBlur }, ref) => (
	<div
		className={cn(
			STYLES.bar,
			'border-t gap-2 cursor-text',
			isFocused ? 'border-emerald-500/30' : 'border-white/5',
		)}
		onClick={() => (ref as React.RefObject<HTMLInputElement>)?.current?.focus()}
	>
		<ChevronRight
			className={cn(STYLES.icon, isFocused ? 'text-emerald-400' : 'text-white/30')}
		/>
		<span
			className={cn(
				STYLES.text,
				'font-semibold',
				isFocused ? 'text-emerald-400' : 'text-white/40',
			)}
		>
			{path}
		</span>
		<span
			className={cn(
				STYLES.text,
				'font-bold',
				isFocused ? 'text-emerald-500' : 'text-white/20',
			)}
		>
			$
		</span>
		<div className="relative flex-1 min-w-0">
			<input
				ref={ref}
				type="text"
				value={value}
				onChange={onChange}
				onKeyDown={onKeyDown}
				onFocus={onFocus}
				onBlur={onBlur}
				className="absolute inset-0 w-full bg-transparent text-transparent caret-transparent outline-none font-mono text-xs"
				autoComplete="off"
				autoCorrect="off"
				spellCheck={false}
				aria-label="Command input"
			/>
			<div
				className={cn(
					STYLES.text,
					'whitespace-pre pointer-events-none flex items-center',
					isFocused ? 'text-white' : 'text-white/60',
				)}
			>
				<span>{value.slice(0, cursorPos)}</span>
				<span
					className={cn(
						'w-2 h-4 bg-emerald-400 animate-pulse',
						!isFocused && 'opacity-0',
					)}
				/>
				<span className="opacity-50">{value.slice(cursorPos)}</span>
			</div>
		</div>
	</div>
));
Input.displayName = 'Input';

// ============================================================================
// Suggestions Component
// ============================================================================

const Suggestions = ({
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
		<div className={cn(STYLES.bar, 'border-t gap-2 flex-wrap h-auto py-2')}>
			<span className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest flex items-center gap-1.5">
				<span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" /> Tab
			</span>
			{items.map((s, i) => (
				<button
					key={s}
					onClick={() => onSelect(s)}
					onMouseEnter={() => onHover(i)}
					className={cn(
						'px-2 py-1 rounded text-xs font-mono transition-colors',
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
};

// ============================================================================
// Output Components
// ============================================================================

const HistoryEntry = ({ item }: { item: HistoryItem }) => (
	<div className="space-y-1">
		{item.command && (
			<div className="flex items-center gap-2 text-xs font-mono">
				<ChevronRight className="w-3 h-3 text-emerald-500/50" />
				<span className="text-white/40">{item.path}</span>
				<span className="text-emerald-500/50">$</span>
				<span className="text-white/80">{item.command}</span>
			</div>
		)}
		{item.response.content && (
			<div
				className={cn(
					'text-xs font-mono pl-5 whitespace-pre-wrap',
					item.response.type === 'error' ? 'text-red-400/80' : 'text-white/60',
				)}
			>
				{item.response.content}
			</div>
		)}
	</div>
);

const Welcome = () => (
	<div className="text-xs font-mono text-white/30 space-y-1">
		<p>
			Welcome! Type <span className="text-emerald-400">help</span> for commands.
		</p>
	</div>
);

// ============================================================================
// Main CLI Component
// ============================================================================

export function CLI() {
	const terminal = useCollapsiblePanel({ type: 'terminal' });
	const state = useTerminalState();
	const { handleKeyDown } = useCLI(state);
	const inputRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	// Auto-scroll on history change
	useEffect(() => {
		if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
	}, [state.history]);

	// Auto-focus input
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	// Collapsed state
	if (terminal.isCollapsed) {
		return (
			<button
				onClick={terminal.expand}
				className="h-full w-full flex items-center justify-center gap-2 bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors group"
			>
				<Terminal className="w-4 h-4 text-white/30 group-hover:text-emerald-400 transition-colors" />
				<span className="text-xs font-mono text-white/30 group-hover:text-white/60 transition-colors">
					Terminal
				</span>
			</button>
		);
	}

	return (
		<div className="h-full flex flex-col bg-black/20 overflow-hidden">
			<Header
				path={state.currentPath}
				isFocused={state.isFocused}
				onClear={state.clearHistory}
				onMinimize={terminal.collapse}
				onMaximize={terminal.maximize}
			/>

			<div
				ref={scrollRef}
				className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3"
				style={{
					scrollbarWidth: 'thin',
					scrollbarColor: 'rgba(255,255,255,0.1) transparent',
				}}
			>
				{state.history.length === 0 && <Welcome />}
				{state.history.map((item, i) => (
					<HistoryEntry key={i} item={item} />
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
