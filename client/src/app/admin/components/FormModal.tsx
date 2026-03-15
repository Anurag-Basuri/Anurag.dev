'use client';

import { useEffect, useRef, type FormEvent } from 'react';

interface FormModalProps {
	open: boolean;
	onClose: () => void;
	title: string;
	onSubmit: () => void;
	loading?: boolean;
	wide?: boolean;
	children: React.ReactNode;
}

export function FormModal({
	open,
	onClose,
	title,
	onSubmit,
	loading,
	wide,
	children,
}: FormModalProps) {
	const backdropRef = useRef<HTMLDivElement>(null);

	// Lock body scroll when modal is open
	useEffect(() => {
		if (!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	}, [open]);

	// Close on Escape
	useEffect(() => {
		if (!open) return;
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose();
		}
		document.addEventListener('keydown', handleKey);
		return () => document.removeEventListener('keydown', handleKey);
	}, [open, onClose]);

	if (!open) return null;

	function handleFormSubmit(e: FormEvent) {
		e.preventDefault();
		if (!loading) onSubmit();
	}

	return (
		<div
			ref={backdropRef}
			onClick={e => {
				if (e.target === backdropRef.current) onClose();
			}}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
		>
			<form
				onSubmit={handleFormSubmit}
				className={`bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-h-[85vh] flex flex-col ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
					<h2 className="text-lg font-semibold text-white">{title}</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-zinc-500 hover:text-zinc-300 transition-colors text-xl leading-none"
					>
						✕
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">{children}</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 shrink-0">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={loading}
						className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium transition-colors"
					>
						{loading ? 'Saving...' : 'Save'}
					</button>
				</div>
			</form>
		</div>
	);
}
