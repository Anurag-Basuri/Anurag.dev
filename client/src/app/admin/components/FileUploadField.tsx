'use client';

import { useState, useRef, type ChangeEvent } from 'react';

interface FileUploadFieldProps {
	label: string;
	/** Current URL (for preview) */
	currentUrl?: string | null;
	/** Which upload function to call */
	onUpload: (file: File) => Promise<unknown>;
	/** Called after successful upload so parent can refetch */
	onSuccess?: () => void;
	/** Accepted file types (e.g. "image/*", ".pdf,.doc,.docx") */
	accept?: string;
	/** Max file size in MB — display only, server enforces */
	maxSizeMB?: number;
}

export function FileUploadField({
	label,
	currentUrl,
	onUpload,
	onSuccess,
	accept = 'image/*',
	maxSizeMB = 10,
}: FileUploadFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [preview, setPreview] = useState<string | null>(null);

	const isImage = accept.startsWith('image');
	const displayUrl = preview || currentUrl;

	async function handleChange(e: ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		// Client-side size check
		if (file.size > maxSizeMB * 1024 * 1024) {
			setError(`File too large. Max ${maxSizeMB} MB.`);
			return;
		}

		// Show preview for images
		if (isImage && file.type.startsWith('image/')) {
			const url = URL.createObjectURL(file);
			setPreview(url);
		}

		setError(null);
		setUploading(true);

		try {
			await onUpload(file);
			onSuccess?.();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Upload failed');
			setPreview(null);
		} finally {
			setUploading(false);
			// Reset input so same file can be re-selected
			if (inputRef.current) inputRef.current.value = '';
		}
	}

	return (
		<div>
			<label className="block text-sm font-medium text-zinc-400 mb-1.5">{label}</label>

			<div className="space-y-2">
				{/* Preview */}
				{isImage && displayUrl && (
					<div className="relative w-full h-32 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
						<img src={displayUrl} alt={label} className="w-full h-full object-cover" />
						{uploading && (
							<div className="absolute inset-0 bg-black/60 flex items-center justify-center">
								<div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							</div>
						)}
					</div>
				)}

				{/* Non-image file indicator */}
				{!isImage && displayUrl && (
					<div className="flex items-center gap-2 p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-sm">
						<span className="text-zinc-400 truncate flex-1">{displayUrl}</span>
						<a
							href={displayUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-blue-400 hover:text-blue-300 shrink-0"
						>
							View
						</a>
					</div>
				)}

				{/* Upload button + hidden input */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => inputRef.current?.click()}
						disabled={uploading}
						className="px-3 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:cursor-not-allowed text-zinc-300 transition-colors"
					>
						{uploading ? 'Uploading...' : displayUrl ? 'Replace' : 'Upload'}
					</button>

					{!isImage && uploading && (
						<div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
					)}

					<span className="text-xs text-zinc-600">Max {maxSizeMB} MB</span>
				</div>

				<input
					ref={inputRef}
					type="file"
					accept={accept}
					onChange={handleChange}
					className="hidden"
				/>
			</div>

			{error && <p className="mt-1 text-xs text-red-400">{error}</p>}
		</div>
	);
}
