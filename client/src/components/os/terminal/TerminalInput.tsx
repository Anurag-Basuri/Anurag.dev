import { forwardRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { TerminalInputProps } from './types';

const getPromptLabel = (path: string) => (
	<span className="font-medium select-none" aria-hidden="true">
		<span className="text-emerald-500 dark:text-emerald-400">root@anuragos</span>
		<span className="text-muted-foreground">:</span>
		<span className="text-sky-500 dark:text-sky-400">{path}</span>
		<span className="text-primary">$</span>
	</span>
);

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
			(ref as React.RefObject<HTMLInputElement>)?.current?.focus();
		}, [ref]);

		// Handle reduced motion
		const shouldReduceMotion = useCallback(() => {
			if (typeof window !== 'undefined') {
				return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			}
			return false;
		}, []);

		return (
			<div
				className="px-4 py-2.5 border-t border-border/50 bg-linear-to-t from-muted/20 to-transparent backdrop-blur-sm shrink-0 space-y-2"
				onClick={handleContainerClick}
				role="form"
				aria-label="Terminal input form"
			>
				<div className="flex items-start gap-2 text-sm">
					<span className="shrink-0 mt-1">{getPromptLabel(currentPath)}</span>
					<div className="relative flex-1 min-w-0">
						<div className="bg-muted/30 px-2.5 py-1.5 rounded-lg border border-border/60 shadow-inner backdrop-blur-sm hover:border-border/80 focus-within:border-primary/50 focus-within:bg-muted/40 transition-all duration-200">
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
								className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-transparent outline-none px-2.5 py-1.5"
								autoComplete="off"
								autoCorrect="off"
								autoCapitalize="off"
								spellCheck="false"
								role="textbox"
								aria-label={`Terminal input at ${currentPath}`}
								aria-describedby="terminal-suggestions"
								aria-autocomplete="list"
								aria-multiline="false"
								aria-current={isFocused}
								enterKeyHint="enter"
							/>
							{/* Visible input display with blinking cursor */}
							<div
								className="whitespace-pre-wrap break-all min-h-5 text-foreground font-mono leading-5"
								aria-hidden="true"
							>
								{/* Render text with block cursor */}
								<span>{input.substring(0, cursorPos)}</span>
								<span
									className={cn(
										'inline-block w-[0.6em] h-[1em] align-text-bottom bg-emerald-500',
										isFocused && !shouldReduceMotion() && 'animate-blink',
									)}
									aria-hidden="true"
								/>
								<span>{input.substring(cursorPos)}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	},
);

TerminalInput.displayName = 'TerminalInput';
