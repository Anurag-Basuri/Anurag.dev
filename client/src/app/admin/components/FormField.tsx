'use client';

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';

interface FormFieldProps {
	label: string;
	name: string;
	type?: 'text' | 'textarea' | 'select' | 'number' | 'url' | 'email' | 'date' | 'checkbox';
	value: string | number | boolean;
	onChange: (name: string, value: string | number | boolean) => void;
	error?: string;
	placeholder?: string;
	options?: { label: string; value: string }[];
	rows?: number;
	required?: boolean;
}

const BASE_CLASS =
	'w-full px-3 py-2 rounded-lg bg-zinc-900 border text-white text-sm placeholder-zinc-600 outline-none transition-colors focus:ring-2 focus:ring-blue-500/40';

function borderClass(error?: string) {
	return error ? 'border-red-500/50' : 'border-zinc-800 hover:border-zinc-700';
}

function FieldLabel({ label, name, required }: { label: string; name: string; required?: boolean }) {
	return (
		<label htmlFor={name} className="block text-sm font-medium text-zinc-400 mb-1.5">
			{label}
			{required && <span className="text-red-400 ml-0.5">*</span>}
		</label>
	);
}

export function FormField({
	label,
	name,
	type = 'text',
	value,
	onChange,
	error,
	placeholder,
	options,
	rows = 3,
	required,
}: FormFieldProps) {
	const cls = `${BASE_CLASS} ${borderClass(error)}`;

	if (type === 'checkbox') {
		return (
			<label className="flex items-center gap-3 cursor-pointer">
				<input
					type="checkbox"
					checked={value as boolean}
					onChange={(e) => onChange(name, e.target.checked)}
					className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500/40"
				/>
				<span className="text-sm text-zinc-300">{label}</span>
				{error && <span className="text-xs text-red-400">{error}</span>}
			</label>
		);
	}

	return (
		<div>
			<FieldLabel label={label} name={name} required={required} />

			{type === 'textarea' ? (
				<textarea
					id={name}
					name={name}
					value={value as string}
					onChange={(e) => onChange(name, e.target.value)}
					placeholder={placeholder}
					rows={rows}
					className={`${cls} resize-y`}
				/>
			) : type === 'select' ? (
				<select
					id={name}
					name={name}
					value={value as string}
					onChange={(e) => onChange(name, e.target.value)}
					className={cls}
				>
					{options?.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			) : (
				<input
					id={name}
					name={name}
					type={type}
					value={type === 'number' ? (value as number) : (value as string)}
					onChange={(e) =>
						onChange(name, type === 'number' ? Number(e.target.value) : e.target.value)
					}
					placeholder={placeholder}
					className={cls}
				/>
			)}

			{error && <p className="mt-1 text-xs text-red-400">{error}</p>}
		</div>
	);
}

// ─── Tag Field (chip-based) ───────────────────────────────────────

interface TagFieldProps {
	label: string;
	name: string;
	value: string[];
	onChange: (name: string, value: string[]) => void;
	error?: string;
	placeholder?: string;
	required?: boolean;
}

export function TagField({ label, name, value, onChange, error, placeholder, required }: TagFieldProps) {
	const [input, setInput] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	const addTags = useCallback(
		(raw: string) => {
			const newTags = raw
				.split(',')
				.map((t) => t.trim())
				.filter((t) => t.length > 0 && !value.includes(t));
			if (newTags.length > 0) {
				onChange(name, [...value, ...newTags]);
			}
			setInput('');
		},
		[name, value, onChange],
	);

	function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addTags(input);
		}
		// Backspace on empty input removes last tag
		if (e.key === 'Backspace' && input === '' && value.length > 0) {
			onChange(name, value.slice(0, -1));
		}
	}

	function handleBlur() {
		if (input.trim()) addTags(input);
	}

	function removeTag(tag: string) {
		onChange(
			name,
			value.filter((t) => t !== tag),
		);
	}

	return (
		<div>
			<FieldLabel label={label} name={name} required={required} />
			<div
				onClick={() => inputRef.current?.focus()}
				className={`flex flex-wrap items-center gap-1.5 min-h-[38px] px-2 py-1.5 rounded-lg bg-zinc-900 border cursor-text transition-colors focus-within:ring-2 focus-within:ring-blue-500/40 ${borderClass(error)}`}
			>
				{value.map((tag) => (
					<span
						key={tag}
						className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-xs text-zinc-300 border border-zinc-700"
					>
						{tag}
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								removeTag(tag);
							}}
							className="text-zinc-500 hover:text-red-400 transition-colors leading-none ml-0.5"
						>
							×
						</button>
					</span>
				))}
				<input
					ref={inputRef}
					id={name}
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={handleBlur}
					placeholder={value.length === 0 ? placeholder || 'Type and press Enter' : ''}
					className="flex-1 min-w-[80px] bg-transparent text-sm text-white outline-none placeholder-zinc-600"
				/>
			</div>
			{error && <p className="mt-1 text-xs text-red-400">{error}</p>}
		</div>
	);
}

