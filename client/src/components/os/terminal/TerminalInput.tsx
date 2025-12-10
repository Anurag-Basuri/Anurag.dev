'use client';

import { forwardRef, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Command } from 'lucide-react';
import type { TerminalInputProps } from './types';

export const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
	(
		{
			input,
			cursorPos,
			isFocused,
			onInputChange,
			onKeyDown,
			onInputSelect,
			onFocus,
			onBlur,
			currentPath,
		},
		ref,
	) => {
		const handleContainerClick = useCallback(() => {
			(ref as React.RefObject<HTMLInputElement | null>)?.current?.focus();
		}, [ref]);

		// Handle reduced motion preference
		const shouldReduceMotion = useCallback(() => {
			if (typeof window !== 'undefined') {
				return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			}
			return false;
		}, []);

		return (
			<div
				className={cn(
					'h-6 px-2 border-t bg-[#161b22] shrink-0 flex items-center gap-3 transition-all duration-200 cursor-text',
					isFocused ? 'border-emerald-500/30' : 'border-white/6',
				)}
				onClick={handleContainerClick}
				role="form"
				aria-label="Terminal input form"
			>
				{/* Prompt */}
				<div className="flex items-center gap-2 shrink-0">
					<div
						className={cn(
							'flex items-center justify-center w-5 h-5 rounded transition-colors',
							isFocused ? 'bg-emerald-500/20' : 'bg-white/4',
						)}
					>
						<ChevronRight
							className={cn(
								'w-3 h-3 transition-colors',
								isFocused ? 'text-emerald-400' : 'text-white/30',
							)}
						/>
					</div>
					<div className="flex items-center gap-1 text-[11px] font-mono">
						<span className="text-emerald-400 font-medium">~{currentPath}</span>
					</div>
				</div>

				{/* Input Area */}
				<div className="relative flex-1 min-w-0">
					{/* Hidden input for text capture */}
					<input
						ref={ref}
						type="text"
						value={input}
						onChange={onInputChange}
						onKeyDown={onKeyDown}
						onSelect={onInputSelect}
						onFocus={onFocus}
						onBlur={onBlur}
						className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-transparent outline-none"
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck="false"
						role="textbox"
						aria-label={`Terminal input at ${currentPath}`}
						aria-describedby="terminal-suggestions"
						aria-autocomplete="list"
						aria-multiline="false"
						enterKeyHint="enter"
					/>

					{/* Visible text with cursor */}
					<div
						className="whitespace-pre break-all text-[12px] font-mono leading-tight"
						aria-hidden="true"
					>
						<span className="text-white/90">{input.substring(0, cursorPos)}</span>
						<span
							className={cn(
								'inline-block w-[2px] h-4 align-[-0.15em] rounded-full transition-opacity',
								isFocused ? 'bg-emerald-400' : 'bg-white/20',
								isFocused && !shouldReduceMotion() && 'animate-blink',
							)}
							aria-hidden="true"
						/>
						<span className="text-white/90">{input.substring(cursorPos)}</span>
					</div>
				</div>

				{/* Keyboard shortcut hint */}
				<div className="hidden sm:flex items-center gap-1 shrink-0 opacity-40 hover:opacity-70 transition-opacity">
					<kbd className="h-4 px-1 rounded bg-white/6 border border-white/8 text-[9px] font-mono text-white/40 flex items-center">
						<Command className="w-2 h-2 mr-0.5" />K
					</kbd>
				</div>
			</div>
		);
	},
);

TerminalInput.displayName = 'TerminalInput';
