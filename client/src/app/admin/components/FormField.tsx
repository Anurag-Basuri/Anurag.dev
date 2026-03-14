'use client';

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
	const baseClass =
		'w-full px-3 py-2 rounded-lg bg-zinc-900 border text-white text-sm placeholder-zinc-600 outline-none transition-colors focus:ring-2 focus:ring-blue-500/40';
	const borderClass = error ? 'border-red-500/50' : 'border-zinc-800 hover:border-zinc-700';

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
			<label htmlFor={name} className="block text-sm font-medium text-zinc-400 mb-1.5">
				{label}
				{required && <span className="text-red-400 ml-0.5">*</span>}
			</label>

			{type === 'textarea' ? (
				<textarea
					id={name}
					name={name}
					value={value as string}
					onChange={(e) => onChange(name, e.target.value)}
					placeholder={placeholder}
					rows={rows}
					className={`${baseClass} ${borderClass} resize-y`}
				/>
			) : type === 'select' ? (
				<select
					id={name}
					name={name}
					value={value as string}
					onChange={(e) => onChange(name, e.target.value)}
					className={`${baseClass} ${borderClass}`}
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
					className={`${baseClass} ${borderClass}`}
				/>
			)}

			{error && <p className="mt-1 text-xs text-red-400">{error}</p>}
		</div>
	);
}

// Tag input — comma-separated string ↔ string[]
interface TagFieldProps {
	label: string;
	name: string;
	value: string[];
	onChange: (name: string, value: string[]) => void;
	error?: string;
	placeholder?: string;
}

export function TagField({ label, name, value, onChange, error, placeholder }: TagFieldProps) {
	return (
		<div>
			<label htmlFor={name} className="block text-sm font-medium text-zinc-400 mb-1.5">
				{label}
			</label>
			<input
				id={name}
				type="text"
				value={value.join(', ')}
				onChange={(e) => {
					const tags = e.target.value
						.split(',')
						.map((t) => t.trim())
						.filter(Boolean);
					onChange(name, tags);
				}}
				placeholder={placeholder || 'Comma-separated values'}
				className={`w-full px-3 py-2 rounded-lg bg-zinc-900 border text-white text-sm placeholder-zinc-600 outline-none transition-colors focus:ring-2 focus:ring-blue-500/40 ${
					error ? 'border-red-500/50' : 'border-zinc-800 hover:border-zinc-700'
				}`}
			/>
			{error && <p className="mt-1 text-xs text-red-400">{error}</p>}
		</div>
	);
}
