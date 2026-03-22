'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import Image from 'next/image';
import { publicService } from '@/api';
import type { BlogPost } from '@/api/schema';
import { ScrollArea } from '@/ui/scroll-area';
import {
	Search,
	Calendar,
	ArrowUpRight,
	BookOpen,
	Clock,
	X,
	ExternalLink,
	Tag,
	ChevronLeft,
	ChevronRight,
	FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem, fadeIn, scaleIn, cardHover } from '@/animations/motion';
import { SectionHeader } from '@/ui/SectionHeader';
import { UrlThumbnail } from '@/ui/UrlThumbnail';
import { cn } from '@/lib/utils';

// ─── Helpers ────────────────────────────────────────────────────

function safeArray<T>(arr: T[] | null | undefined): T[] {
	return Array.isArray(arr) ? arr : [];
}

function readingTime(content: string | null | undefined): number {
	if (!content) return 1;
	return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function formatDate(date: string | null | undefined): string {
	if (!date) return '';
	try {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	} catch {
		return '';
	}
}

function timeAgo(date: string | null | undefined): string {
	if (!date) return '';
	try {
		const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
		if (seconds < 0) return 'Just now';
		const intervals = [
			{ label: 'yr', seconds: 31536000 },
			{ label: 'mo', seconds: 2592000 },
			{ label: 'wk', seconds: 604800 },
			{ label: 'd', seconds: 86400 },
			{ label: 'hr', seconds: 3600 },
		];
		for (const { label, seconds: s } of intervals) {
			const count = Math.floor(seconds / s);
			if (count >= 1) return `${count}${label} ago`;
		}
		return 'Just now';
	} catch {
		return '';
	}
}

// ─── Skeleton ───────────────────────────────────────────────────

function BlogSkeleton() {
	return (
		<div className="p-4 sm:p-6 md:p-12 space-y-4 animate-pulse max-w-7xl mx-auto pb-16">
			<div className="space-y-3 mb-8">
				<div className="h-5 w-28 bg-foreground/5 rounded-lg" />
				<div className="h-8 w-56 bg-foreground/5 rounded-xl" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
				{[1, 2, 3, 4, 5, 6].map(i => (
					<div key={i} className="h-52 bg-foreground/5 rounded-xl" />
				))}
			</div>
		</div>
	);
}

// ─── Image Gallery (memoized) ───────────────────────────────────

const ImageGallery = memo(function ImageGallery({ images }: { images: string[] }) {
	const [current, setCurrent] = useState(0);
	if (images.length === 0) return null;

	return (
		<div className="space-y-3">
			<div className="relative aspect-video rounded-2xl sm:rounded-xl overflow-hidden border border-border bg-black">
				<Image
					src={images[current] ?? ''}
					alt={`Image ${current + 1}`}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 800px"
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60 pointer-events-none" />

				{images.length > 1 && (
					<>
						<button
							onClick={() => setCurrent(p => (p - 1 + images.length) % images.length)}
							className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-background/40 backdrop-blur-md border border-border text-foreground/70 hover:text-foreground hover:bg-background/80 hover:scale-110 transition-all"
							aria-label="Previous image"
						>
							<ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5 text-foreground" />
						</button>
						<button
							onClick={() => setCurrent(p => (p + 1) % images.length)}
							className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-background/40 backdrop-blur-md border border-border text-foreground/70 hover:text-foreground hover:bg-background/80 hover:scale-110 transition-all"
							aria-label="Next image"
						>
							<ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 text-foreground" />
						</button>
						<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-full bg-background/40 backdrop-blur-md border border-border">
							{images.map((_, i) => (
								<button
									key={i}
									onClick={() => setCurrent(i)}
									className={cn(
										'h-2 rounded-full transition-all duration-300',
										i === current
											? 'bg-indigo-400 w-8'
											: 'bg-white/40 hover:bg-foreground/70 w-2',
									)}
									aria-label={`Go to image ${i + 1}`}
								/>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
});

// ─── Post Card (compact, memoized) ──────────────────────────────

const PostCard = memo(function PostCard({
	post,
	onClick,
}: {
	post: BlogPost;
	onClick: () => void;
}) {
	const tags = safeArray(post.tags);

	return (
		<motion.article
			variants={staggerItem}
			layout
			onClick={onClick}
			role="button"
			tabIndex={0}
			whileHover={cardHover}
			onKeyDown={e => e.key === 'Enter' && onClick()}
			className="group relative flex flex-col h-full rounded-xl overflow-hidden bg-linear-to-br from-white/5 to-transparent backdrop-blur-sm border border-border hover:border-indigo-500/40 transition-all duration-300 cursor-pointer shadow-lg focus-visible:ring-2 focus-visible:ring-primary/50 outline-none"
		>
			<div className="absolute inset-0 bg-linear-to-br from-indigo-500/0 to-transparent group-hover:from-indigo-500/8 transition-colors duration-300 pointer-events-none" />

			{/* Thumbnail — compact */}
			<div className="relative aspect-video overflow-hidden bg-card">
				<UrlThumbnail
					url={post.coverImage || post.link}
					title={post.title ?? 'Blog post'}
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					fallbackIcon={FileText}
					fallbackGradient="from-indigo-950/60"
				/>
				<div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-[#0a0a0a] to-transparent pointer-events-none" />

				{post.link && (
					<a
						href={post.link}
						target="_blank"
						rel="noopener noreferrer"
						onClick={e => e.stopPropagation()}
						className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/60 backdrop-blur-md border border-border text-muted-foreground hover:text-indigo-400 hover:border-indigo-500/30 transition-all z-20 group/link"
						aria-label="Open external link"
					>
						<ExternalLink className="w-3 h-3" />
					</a>
				)}
			</div>

			{/* Content — tight */}
			<div className="flex flex-col grow p-3 relative z-10">
				<div className="flex items-center gap-2 text-[9px] text-indigo-400 font-bold uppercase tracking-wider mb-1.5">
					<span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
					<span className="w-0.5 h-0.5 rounded-full bg-indigo-500/50" />
					<span>{readingTime(post.content)} min</span>
				</div>

				<h3 className="text-sm font-black text-foreground leading-tight tracking-tight mb-1.5 group-hover:text-indigo-100 transition-colors line-clamp-2">
					{post.title ?? 'Untitled'}
				</h3>

				<p className="text-[10px] text-muted-foreground leading-snug line-clamp-2 mb-3 font-medium">
					{post.content ?? ''}
				</p>

				{tags.length > 0 && (
					<div className="mt-auto flex flex-wrap gap-1.5 pt-2.5 border-t border-border">
						{tags.slice(0, 3).map(tag => (
							<span
								key={tag}
								className="px-2 py-0.5 rounded-md text-[8px] uppercase font-black tracking-widest bg-card border border-border text-foreground/60 group-hover:border-indigo-500/20 group-hover:text-indigo-400 transition-colors"
							>
								{tag}
							</span>
						))}
						{tags.length > 3 && (
							<span className="px-2 py-0.5 rounded-md text-[8px] uppercase font-black tracking-widest bg-card border border-border text-muted-foreground">
								+{tags.length - 3}
							</span>
						)}
					</div>
				)}
			</div>
		</motion.article>
	);
});

// ─── Detail Modal ───────────────────────────────────────────────

function BlogDetailModal({ post, onClose }: { post: BlogPost; onClose: () => void }) {
	const tags = safeArray(post.tags);
	const allImages = [
		...(post.coverImage ? [post.coverImage] : []),
		...safeArray(post.otherImages),
	];

	// Keyboard: Escape to close
	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose();
		}
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	}, [onClose]);

	// Body scroll lock
	useEffect(() => {
		const original = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = original;
		};
	}, []);

	// Progress bar state
	const [scrollProgress, setScrollProgress] = useState(0);

	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8">
			{/* Frosted Glass Backdrop */}
			<motion.div
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				exit="hidden"
				onClick={onClose}
				className="absolute inset-0 bg-black/60 backdrop-blur-3xl"
			/>

			{/* Modal Container — vertical stack */}
			<motion.div
				variants={scaleIn}
				initial="hidden"
				animate="visible"
				exit="hidden"
				className="relative w-full h-full sm:h-auto sm:max-h-[92vh] max-w-3xl bg-card/95 backdrop-blur-xl border-0 sm:border border-white/10 sm:rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden"
			>
				{/* Reading Progress Bar — very top */}
				<div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5 z-50">
					<div
						className="h-full bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-150"
						style={{ width: `${scrollProgress}%` }}
					/>
				</div>

				{/* Top Action Bar — above the image, completely separate */}
				<div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5 bg-black/20 shrink-0">
					<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
						<BookOpen className="w-3.5 h-3.5" />
						<span>Article</span>
					</div>
					<div className="flex items-center gap-2">
						{post.link && (
							<a
								href={post.link}
								target="_blank"
								rel="noopener noreferrer"
								title="Read Original Article"
								className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 font-bold uppercase tracking-wider text-[9px] sm:text-[10px] transition-all"
							>
								<ExternalLink className="w-3 h-3" />
								<span className="hidden sm:inline">Original</span>
							</a>
						)}
						<button
							onClick={onClose}
							className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-foreground transition-all hover:rotate-90 hover:scale-110"
							aria-label="Close article"
						>
							<X className="w-4 h-4" />
						</button>
					</div>
				</div>

				{/* Scrollable Body */}
				<ScrollArea
					className="flex-1 min-h-0"
					onScrollCapture={(e) => {
						const target = e.currentTarget;
						if (target) {
							const { scrollTop, scrollHeight, clientHeight } = target;
							const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
							setScrollProgress(Number.isNaN(progress) ? 0 : Math.min(progress, 100));
						}
					}}
				>
					<div className="flex flex-col">
						{/* Clean Image Section — completely clean, no overlays */}
						{(post.coverImage || post.link) && (
							<div className="relative w-full bg-black/40 flex items-center justify-center overflow-hidden shrink-0" style={{ maxHeight: '40vh' }}>
								{post.coverImage ? (
									<div className="relative w-full aspect-video">
										<Image
											src={post.coverImage}
											alt={post.title ?? 'Article cover'}
											fill
											sizes="100vw"
											className="object-cover"
											priority
										/>
									</div>
								) : (
									<div className="relative w-full aspect-video">
										<UrlThumbnail url={post.link} title={post.title ?? 'Blog post'} fallbackIcon={FileText} fallbackGradient="from-indigo-950/60" />
									</div>
								)}
							</div>
						)}

						{/* No cover at all — minimal placeholder */}
						{!post.coverImage && !post.link && (
							<div className="w-full h-32 sm:h-40 bg-linear-to-br from-indigo-900/20 to-black/60 flex items-center justify-center shrink-0">
								<FileText className="w-16 h-16 text-white/5" />
							</div>
						)}

						{/* Editorial Content Container */}
						<div className="p-5 sm:p-8 md:p-10 space-y-6 pb-24">
							{/* Meta badges */}
							<div className="flex flex-wrap items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-indigo-300">
								<span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
									<Calendar className="w-3 h-3" />
									{formatDate(post.publishedAt ?? post.createdAt)}
								</span>
								<span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
									<Clock className="w-3 h-3" />
									{readingTime(post.content)} min read
								</span>
							</div>

							{/* Title */}
							<h1 className="text-xl sm:text-3xl md:text-4xl font-black text-foreground leading-tight tracking-tight">
								{post.title ?? 'Untitled Article'}
							</h1>

							{/* Tags */}
							{tags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{tags.map(tag => (
										<span
											key={tag}
											className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
										>
											{tag}
										</span>
									))}
								</div>
							)}

							{/* Divider */}
							<div className="border-t border-white/5" />

							{/* Article Body */}
							<article className="prose prose-invert prose-sm sm:prose-base max-w-none text-foreground/80 leading-relaxed font-medium prose-headings:font-black prose-headings:tracking-tight prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:border prose-img:border-border">
								<div className="whitespace-pre-wrap tracking-wide text-sm sm:text-base">
									{post.content ?? ''}
								</div>
							</article>

							{/* Image Gallery */}
							{allImages.length > 1 && (
								<div className="mt-10 pt-6 border-t border-white/5">
									<h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-6 flex items-center gap-2">
										<BookOpen className="w-3.5 h-3.5" />
										Media Gallery
									</h4>
									<ImageGallery images={allImages} />
								</div>
							)}

							{/* Footer Meta */}
							<div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground/60">
								<span>ID: {post.id}</span>
								{post.updatedAt && post.updatedAt !== post.createdAt && (
									<span>Last Updated: {formatDate(post.updatedAt)}</span>
								)}
							</div>
						</div>
					</div>
				</ScrollArea>
			</motion.div>
		</div>
	);
}

// ─── Main Module Component ──────────────────────────────────────

export function BlogModule() {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

	useEffect(() => {
		let cancelled = false;
		async function fetchPosts() {
			try {
				const { data } = await publicService.getBlogPosts();
				if (!cancelled) setPosts(data || []);
			} catch (err) {
				console.error('Failed to load blog posts', err);
				if (!cancelled)
					setError(err instanceof Error ? err.message : 'Failed to load posts');
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		fetchPosts();
		return () => {
			cancelled = true;
		};
	}, []);

	const handleSelectPost = useCallback((post: BlogPost) => setSelectedPost(post), []);
	const handleCloseModal = useCallback(() => setSelectedPost(null), []);

	if (loading) return <BlogSkeleton />;

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-32 text-center max-w-7xl mx-auto">
				<div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-6 shadow-inner shadow-rose-500/20">
					<BookOpen className="w-8 h-8 text-rose-400" />
				</div>
				<p className="text-xl font-bold text-foreground mb-2 tracking-tight">
					Failed to load articles
				</p>
				<p className="text-xs text-muted-foreground leading-snug mb-8 max-w-sm">{error}</p>
				<button
					onClick={() => window.location.reload()}
					className="px-6 py-3 rounded-xl bg-foreground/5 border border-border text-xs font-bold uppercase tracking-wider text-foreground hover:bg-foreground/10 hover:border-white/20 transition-all active:scale-95 shadow-lg"
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="h-full w-full">
			<div className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto pb-10 sm:pb-14 pt-6 md:pt-8">
				{/* Header */}
				<SectionHeader
					label="Insights"
					icon={BookOpen}
					title="Engineering Log"
					description="Thoughts, tutorials, and deep dives into software engineering, systems design, and technology."
					sectionId="blog"
				/>

				{posts.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-24 mt-4 text-muted-foreground border border-dashed border-border rounded-[2.5rem] bg-card/50">
						<div className="p-4 rounded-full bg-foreground/5 mb-6 shadow-inner">
							<BookOpen className="w-8 h-8 text-indigo-400/50" />
						</div>
						<p className="text-lg font-medium text-foreground/80 px-4 text-center">
							No articles published yet.
						</p>
					</div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-20px' }}
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6"
					>
						{posts.map(post => (
							<PostCard
								key={post.id}
								post={post}
								onClick={() => handleSelectPost(post)}
							/>
						))}
					</motion.div>
				)}

				{/* Detail Modal */}
				<AnimatePresence>
					{selectedPost && (
						<BlogDetailModal post={selectedPost} onClose={handleCloseModal} />
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
