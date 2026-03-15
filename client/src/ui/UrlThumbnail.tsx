'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { FileText } from 'lucide-react';
import { apiClient, ApiClientError } from '@/api/client';

// ─── URL type detection ─────────────────────────────────────────

const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|svg|avif|bmp|ico)(\?.*)?$/i;
const PDF_EXT = /\.pdf(\?.*)?$/i;

function getUrlType(url: string): 'image' | 'pdf' | 'website' {
	const cleaned = url.split('#')[0];
	if (IMAGE_EXTS.test(cleaned)) return 'image';
	if (PDF_EXT.test(cleaned)) return 'pdf';
	return 'website';
}

// ─── In-memory client cache for OG results ──────────────────────

const ogCache = new Map<string, string | null>();

async function fetchOgImage(url: string): Promise<string | null> {
	if (ogCache.has(url)) return ogCache.get(url)!;

	try {
		const result = await apiClient.get<{ ogImage: string | null }>(
			`/link-preview?url=${encodeURIComponent(url)}`,
		);
		ogCache.set(url, result.ogImage);
		return result.ogImage;
	} catch (err) {
		if (err instanceof ApiClientError) {
			ogCache.set(url, null);
		}
		return null;
	}
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
	/** next/image sizes attribute */
	sizes?: string;
	/** next/image priority flag */
	priority?: boolean;
	/** Tailwind classes for the <Image> element */
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
	const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
	const [imgFailed, setImgFailed] = useState(false);
	const [isPdf, setIsPdf] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		if (!url) {
			setLoading(false);
			return;
		}

		const type = getUrlType(url);

		if (type === 'image') {
			setResolvedSrc(url);
			setLoading(false);
			return;
		}

		if (type === 'pdf') {
			setIsPdf(true);
			setLoading(false);
			return;
		}

		// Website URL → fetch OG image from server
		fetchOgImage(url).then(og => {
			if (cancelled) return;
			if (og) setResolvedSrc(og);
			setLoading(false);
		});

		return () => {
			cancelled = true;
		};
	}, [url]);

	const handleImgError = useCallback(() => setImgFailed(true), []);

	// Loading shimmer
	if (loading) {
		return <div className="w-full h-full bg-[#0a0a0a] animate-pulse" />;
	}

	// Resolved image (direct image or OG image from website)
	if (resolvedSrc && !imgFailed) {
		return (
			<>
				<div className="absolute inset-0 bg-[#050505] z-0" />
				<Image
					src={resolvedSrc}
					alt={title}
					fill
					sizes={sizes}
					className={imgClassName}
					onError={handleImgError}
					priority={priority}
				/>
			</>
		);
	}

	// PDF placeholder
	if (isPdf) {
		return (
			<div className="w-full h-full bg-gradient-to-br from-rose-950/60 via-[#0a0a0a] to-[#050505] flex flex-col items-center justify-center gap-2 relative overflow-hidden">
				<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
				<div className="relative flex flex-col items-center gap-2">
					<div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
						<FileText className="w-8 h-8 text-rose-400/60" />
					</div>
					<span className="text-[9px] font-bold uppercase tracking-[0.2em] text-rose-400/50">
						PDF Document
					</span>
				</div>
			</div>
		);
	}

	// Fallback placeholder
	return (
		<div
			className={`w-full h-full bg-gradient-to-br ${fallbackGradient} via-[#0a0a0a] to-[#050505] flex flex-col items-center justify-center gap-3 relative overflow-hidden`}
		>
			<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
			<FallbackIcon className="w-10 h-10 text-white/10 group-hover:text-white/20 transition-colors duration-500 relative" />
			{fallbackLabel && (
				<span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 relative">
					{fallbackLabel}
				</span>
			)}
		</div>
	);
});
