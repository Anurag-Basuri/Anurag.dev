'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import { FileText, Globe } from 'lucide-react';

// ─── URL type detection ─────────────────────────────────────────

const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|svg|avif|bmp|ico)(\?.*)?$/i;
const PDF_EXT = /\.pdf(\?.*)?$/i;

type UrlKind = 'image' | 'pdf' | 'website' | 'empty';

function classifyUrl(url: string | null | undefined): UrlKind {
	if (!url) return 'empty';
	const cleaned = url.split('#')[0];
	if (IMAGE_EXTS.test(cleaned)) return 'image';
	if (PDF_EXT.test(cleaned)) return 'pdf';
	return 'website';
}

/**
 * Generates a screenshot URL for any website using free public services.
 * WordPress mshots API provides highly reliable website previews.
 */
function getScreenshotUrl(websiteUrl: string, width = 1280): string {
	return `https://s0.wp.com/mshots/v1/${encodeURIComponent(websiteUrl)}?w=${width}`;
}

// ─── Component ──────────────────────────────────────────────────

export interface UrlThumbnailProps {
	/** The URL to display — can be an image, PDF, or website URL */
	url: string | null | undefined;
	/** Alt text / accessible title */
	title: string;
	/** Icon to show in the fallback placeholder */
	fallbackIcon?: LucideIcon;
	/** Label text below the fallback icon */
	fallbackLabel?: string;
	/** Tailwind gradient from-* class for the fallback (e.g. "from-emerald-950/60") */
	fallbackGradient?: string;
	/** next/image sizes attribute (preserved for API compatibility) */
	sizes?: string;
	/** priority flag */
	priority?: boolean;
	/** Tailwind classes for the <img> element */
	imgClassName?: string;
}

export const UrlThumbnail = memo(function UrlThumbnail({
	url,
	title,
	fallbackIcon: FallbackIcon = FileText,
	fallbackLabel,
	fallbackGradient = 'from-[#111]',
	sizes,
	priority = false,
	imgClassName = 'object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform',
}: UrlThumbnailProps) {
	const [imgFailed, setImgFailed] = useState(false);
	const handleImgError = useCallback(() => setImgFailed(true), []);

	const kind = classifyUrl(url);

	// ── Direct image URL → render with resilient <img> tag ─────────
	if (kind === 'image' && url && !imgFailed) {
		return (
			<>
				<div className="absolute inset-0 bg-card z-0" />
				<img
					src={url}
					alt={title}
					className={`absolute inset-0 w-full h-full ${imgClassName}`}
					onError={handleImgError}
					loading={priority ? 'eager' : 'lazy'}
					decoding="async"
				/>
			</>
		);
	}

	// ── Website & PDF URL → try screenshot service first ────────
	if ((kind === 'website' || kind === 'pdf') && url && !imgFailed) {
		const screenshotSrc = getScreenshotUrl(url);
		return (
			<>
				<div className="absolute inset-0 bg-card z-0" />
				<img
					src={screenshotSrc}
					alt={`Preview of ${title}`}
					className={`absolute inset-0 w-full h-full ${imgClassName}`}
					onError={handleImgError}
					loading={priority ? 'eager' : 'lazy'}
					decoding="async"
				/>
			</>
		);
	}

	// ── PDF Fallback → styled placeholder (if screenshot failed) 
	if (kind === 'pdf') {
		return (
			<div className="w-full h-full bg-linear-to-br from-rose-950/60 via-[#0a0a0a] to-[#050505] flex flex-col items-center justify-center gap-2 relative overflow-hidden">
				<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
				<div className="relative flex flex-col items-center gap-2">
					<div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
						<FileText className="w-8 h-8 text-rose-400/60" />
					</div>
					<span className="text-[11px] font-mono font-medium uppercase tracking-wider text-rose-400/60">
						PDF Document
					</span>
				</div>
			</div>
		);
	}

	// ── Fallback placeholder (no URL, or image load failed) ─────
	return (
		<div
			className={`w-full h-full bg-linear-to-br ${fallbackGradient} via-[#0a0a0a] to-[#050505] flex flex-col items-center justify-center gap-3 relative overflow-hidden`}
		>
			<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
			<FallbackIcon className="w-10 h-10 text-white/10 group-hover:text-muted-foreground transition-colors duration-500 relative" />
			{fallbackLabel && (
				<span className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground relative">
					{fallbackLabel}
				</span>
			)}
		</div>
	);
});
