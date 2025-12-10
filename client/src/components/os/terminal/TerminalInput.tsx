'use client';

import { forwardRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
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

		const shouldReduceMotion = useCallback(() => {
			if (typeof window !== 'undefined') {
				return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			}
			return false;
		}, []);

		return (
			<div
				className={cn(
					'h-6 px-2 border-t bg-[#161b22] shrink-0 flex items-center gap-2 cursor-text transition-colors',
					isFocused ? 'border-emerald-500/20' : 'border-white/8',
				)}
				onClick={handleContainerClick}
				role="form"
				aria-label="Terminal input"
			>
				{/* Prompt Icon */}
				<ChevronRight
					className={cn(
						'w-3 h-3 shrink-0 transition-colors',
						isFocused ? 'text-emerald-400' : 'text-white/20',
					)}
				/>

				{/* Path */}
				<span className="text-[10px] font-mono text-emerald-400/70 shrink-0">
					{currentPath}
				</span>

				<span className="text-[10px] text-white/20 shrink-0">$</span>

				{/* Input Area */}
				<div className="relative flex-1 min-w-0">
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
						aria-label="Command input"
						enterKeyHint="enter"
					/>
					<div
						className="whitespace-pre text-[11px] font-mono text-white/90 leading-tight"
						aria-hidden="true"
					>
						<span>{input.substring(0, cursorPos)}</span>
						<span
							className={cn(
								'inline-block w-[1.5px] h-3 align-[-0.1em] rounded-full',
								isFocused ? 'bg-emerald-400' : 'bg-white/15',
								isFocused && !shouldReduceMotion() && 'animate-blink',
							)}
						/>
						<span>{input.substring(cursorPos)}</span>
					</div>
				</div>
			</div>
		);
	},
);

TerminalInput.displayName = 'TerminalInput';
