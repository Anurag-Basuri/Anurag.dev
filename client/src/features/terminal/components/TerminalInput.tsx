'use client';

import { forwardRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STYLES = {
	bar: 'h-9 px-3 bg-muted/30 backdrop-blur-md border-border/30 flex items-center shrink-0',
	icon: 'w-3.5 h-3.5 shrink-0',
	text: 'text-xs font-mono',
} as const;

interface TerminalInputProps {
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

export const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
	(
		{ value, path, cursorPos, isFocused, isExecuting, onChange, onKeyDown, onFocus, onBlur },
		ref,
	) => (
		<div
			className={cn(
				STYLES.bar,
				'border-t gap-1.5 sm:gap-2 cursor-text transition-all duration-300',
				isFocused
					? 'border-primary/40 bg-muted/60 ring-1 ring-primary/20 shadow-sm'
					: 'border-border/30 hover:border-border/50 hover:bg-muted/40',
				isExecuting && 'opacity-60 pointer-events-none',
			)}
			onClick={() => (ref as React.RefObject<HTMLInputElement | null>)?.current?.focus()}
		>
			<ChevronRight
				className={cn(
					STYLES.icon,
					'transition-colors duration-200',
					isFocused ? 'text-primary' : 'text-muted-foreground/50',
				)}
			/>
			<span
				className={cn(
					STYLES.text,
					'font-semibold transition-colors duration-200 hidden sm:inline',
					isFocused ? 'text-primary' : 'text-muted-foreground/60',
				)}
			>
				{path}
			</span>
			<span
				className={cn(
					STYLES.text,
					'font-bold transition-colors duration-200',
					isFocused ? 'text-primary' : 'text-muted-foreground/40',
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
						isFocused ? 'text-foreground' : 'text-foreground/60',
					)}
				>
					<span>{value.slice(0, cursorPos)}</span>
					<span
						className={cn(
							'inline-block w-[2px] h-[14px] bg-primary rounded-sm',
							isFocused
								? 'animate-[cursor-blink_1s_ease-in-out_infinite]'
								: 'opacity-0',
						)}
					/>
					<span className="text-muted-foreground/60">{value.slice(cursorPos)}</span>
				</div>
			</div>
		</div>
	),
);
TerminalInput.displayName = 'TerminalInput';
