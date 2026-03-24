'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import Image from 'next/image';
import { publicService } from '@/api';
import type { BlogPost } from '@/api/schema';
import {
	Calendar,
	BookOpen,
	Clock,
	X,
	ExternalLink,
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
			<div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-black">
				<Image
					src={images[current] ?? ''}
					alt={`Image ${current + 1}`}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 800px"
					className="object-cover"
				/>
				{images.length > 1 && (
					<>
						<button
							onClick={() => setCurrent(p => (p - 1 + images.length) % images.length)}
							className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/40 backdrop-blur-md border border-border text-foreground/70 hover:text-foreground hover:bg-background/80 hover:scale-110 transition-all"
							aria-label="Previous image"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						<button
							onClick={() => setCurrent(p => (p + 1) % images.length)}
							className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/40 backdrop-blur-md border border-border text-foreground/70 hover:text-foreground hover:bg-background/80 hover:scale-110 transition-all"
							aria-label="Next image"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
						<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 rounded-full bg-background/40 backdrop-blur-md border border-border">
							{images.map((_, i) => (
								<button
									key={i}
									onClick={() => setCurrent(i)}
									className={cn(
										'h-1.5 rounded-full transition-all duration-300',
										i === current
											? 'w-6'
											: 'bg-white/40 hover:bg-foreground/70 w-1.5',
									)}
									style={i === current ? { background: 'var(--theme-secondary)' } : undefined}
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

// ─── Post Card (memoized) ───────────────────────────────────────

const PostCard = memo(function PostCard({
	post,
	onClick,
}: {
	post: BlogPost;
	onClick: () => void;
}) {
	const tags = safeArray(post.tags);
	const dateStr = formatDate(post.publishedAt ?? post.createdAt);

	return (
		<motion.article
			variants={staggerItem}
			layout
			onClick={onClick}
			role="button"
			tabIndex={0}
			whileHover={cardHover}
			onKeyDown={e => e.key === 'Enter' && onClick()}
			className="group relative flex flex-col h-full rounded-xl overflow-hidden bg-linear-to-br from-foreground/5 to-transparent backdrop-blur-sm border border-border hover:border-(--theme-secondary)/40 transition-all duration-300 cursor-pointer shadow-lg focus-visible:ring-2 focus-visible:ring-primary/50 outline-none"
		>
			<div className="absolute inset-0 bg-linear-to-br from-transparent to-transparent group-hover:from-(--theme-secondary)/8 transition-colors duration-300 pointer-events-none" />

			{/* Thumbnail — edge-to-edge */}
			<div className="relative aspect-video overflow-hidden bg-card">
				<UrlThumbnail
					url={post.coverImage || post.link}
					title={post.title ?? 'Blog post'}
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					fallbackIcon={FileText}
					fallbackGradient="from-indigo-950/60"
				/>
				<div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-card to-transparent pointer-events-none" />

				{/* Direct redirect button on preview image */}
				{post.link && (
					<a
						href={post.link}
						target="_blank"
						rel="noopener noreferrer"
						onClick={e => e.stopPropagation()}
						className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg backdrop-blur-md border text-white/90 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300 text-[9px] font-bold uppercase tracking-wider hover:scale-105 active:scale-95"
						style={{
							background: 'color-mix(in oklch, var(--theme-secondary) 25%, rgba(0,0,0,0.5))',
							borderColor: 'color-mix(in oklch, var(--theme-secondary) 40%, transparent)',
						}}
						aria-label="Open original post"
					>
						<ExternalLink className="w-3 h-3" />
						<span className="hidden sm:inline">Read</span>
					</a>
				)}
			</div>

			{/* Content — separate from image */}
			<div className="flex flex-col grow p-3 relative z-10">
				{/* Date */}
				{dateStr && (
					<div
						className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider mb-1.5"
						style={{ color: 'var(--theme-secondary)' }}
					>
						<Calendar className="w-3 h-3" />
						<span>{dateStr}</span>
					</div>
				)}

				{/* Title */}
				<h3 className="text-sm font-black text-foreground leading-tight tracking-tight mb-2 group-hover:text-foreground/90 transition-colors line-clamp-2">
					{post.title ?? 'Untitled'}
				</h3>

				{/* Tags */}
				{tags.length > 0 && (
					<div className="mt-auto flex flex-wrap gap-1.5 pt-2.5 border-t border-border">
						{tags.slice(0, 3).map(tag => (
							<span
								key={tag}
								className="px-2 py-0.5 rounded-md text-[8px] uppercase font-black tracking-widest bg-card border border-border text-foreground/60 group-hover:border-(--theme-secondary)/20 group-hover:text-(--theme-secondary) transition-colors"
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

// ─── Blog Detail Modal (Desktop) ────────────────────────────────

function BlogDetailModal({ post, onClose }: { post: BlogPost; onClose: () => void }) {
	const tags = safeArray(post.tags);
	const allImages = [
		...(post.coverImage ? [post.coverImage] : []),
		...safeArray(post.otherImages),
	];

	useEffect(() => {
		const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [onClose]);

	useEffect(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => { document.body.style.overflow = prev; };
	}, []);

	const [scrollProgress, setScrollProgress] = useState(0);

	const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		const el = e.currentTarget;
		const { scrollTop, scrollHeight, clientHeight } = el;
		const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
		setScrollProgress(Number.isNaN(progress) ? 0 : Math.min(progress, 100));
	}, []);

	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8">
			{/* Backdrop */}
			<motion.div
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				exit="hidden"
				onClick={onClose}
				className="absolute inset-0 backdrop-blur-xl"
				style={{ background: 'color-mix(in oklch, var(--background) 85%, var(--theme-secondary))' }}
			/>

			{/* ── Desktop Modal (hidden below sm) ── */}
			<motion.div
				variants={scaleIn}
				initial="hidden"
				animate="visible"
				exit="hidden"
				className={cn(
					'relative z-10 hidden sm:flex flex-col overflow-hidden',
					'w-full sm:max-h-[92vh] max-w-3xl',
					'bg-card/80 backdrop-blur-2xl',
					'border border-border rounded-2xl',
					'shadow-2xl',
				)}
			>
				{/* Reading Progress Bar */}
				<div className="absolute top-0 left-0 right-0 h-0.5 bg-border z-50">
					<div
						className="h-full rounded-r-full transition-all duration-150"
						style={{
							width: `${scrollProgress}%`,
							background: 'var(--theme-secondary)',
							boxShadow: '0 0 8px color-mix(in oklch, var(--theme-secondary) 50%, transparent)',
						}}
					/>
				</div>

				{/* Sticky Header */}
				<div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card/60 backdrop-blur-xl shrink-0">
					<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
						<BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--theme-secondary)' }} />
						<span>Article</span>
					</div>
					<div className="flex items-center gap-2">
						{post.link && (
							<a
								href={post.link}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
								style={{
									background: 'color-mix(in oklch, var(--theme-secondary) 10%, transparent)',
									color: 'var(--theme-secondary)',
									border: '1px solid color-mix(in oklch, var(--theme-secondary) 20%, transparent)',
								}}
							>
								<ExternalLink className="w-3 h-3" />
								<span>Original</span>
							</a>
						)}
						<button
							onClick={onClose}
							className="p-2 rounded-full bg-muted hover:bg-accent border border-border text-muted-foreground hover:text-foreground transition-all hover:rotate-90 hover:scale-110"
							aria-label="Close article"
						>
							<X className="w-4 h-4" />
						</button>
					</div>
				</div>

				{/* Scrollable Body */}
				<div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" onScroll={handleScroll}>
					{/* Cover Image */}
					{(post.coverImage || post.link) && (
						<div className="relative w-full bg-muted overflow-hidden shrink-0" style={{ maxHeight: '40vh' }}>
							{post.coverImage ? (
								<div className="relative w-full aspect-video">
									<Image src={post.coverImage} alt={post.title ?? 'Article cover'} fill sizes="100vw" className="object-cover" priority />
								</div>
							) : (
								<div className="relative w-full aspect-video">
									<UrlThumbnail url={post.link} title={post.title ?? 'Blog post'} fallbackIcon={FileText} fallbackGradient="from-indigo-950/60" />
								</div>
							)}
						</div>
					)}

					{!post.coverImage && !post.link && (
						<div className="w-full h-32 sm:h-40 bg-muted flex items-center justify-center shrink-0">
							<FileText className="w-16 h-16 text-foreground/5" />
						</div>
					)}

					{/* Content */}
					<div className="p-5 sm:p-8 md:p-10 space-y-6 pb-16">
						{/* Meta badges */}
						<div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--theme-secondary)' }}>
							<span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border">
								<Calendar className="w-3 h-3" />
								{formatDate(post.publishedAt ?? post.createdAt)}
							</span>
							<span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border">
								<Clock className="w-3 h-3" />
								{readingTime(post.content)} min read
							</span>
						</div>

						<h1 className="text-xl sm:text-3xl md:text-4xl font-black text-foreground leading-tight tracking-tight">
							{post.title ?? 'Untitled Article'}
						</h1>

						{tags.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{tags.map(tag => (
									<span
										key={tag}
										className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest"
										style={{
											background: 'color-mix(in oklch, var(--theme-secondary) 10%, transparent)',
											color: 'var(--theme-secondary)',
											border: '1px solid color-mix(in oklch, var(--theme-secondary) 20%, transparent)',
										}}
									>
										{tag}
									</span>
								))}
							</div>
						)}

						<div className="border-t border-border" />

						<article className="prose prose-invert prose-sm sm:prose-base max-w-none text-foreground/80 leading-relaxed font-medium prose-headings:font-black prose-headings:tracking-tight prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:border prose-img:border-border">
							<div className="whitespace-pre-wrap tracking-wide text-sm sm:text-base">
								{post.content ?? ''}
							</div>
						</article>

						{allImages.length > 1 && (
							<div className="mt-10 pt-6 border-t border-border">
								<h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2" style={{ color: 'var(--theme-secondary)' }}>
									<BookOpen className="w-3.5 h-3.5" />
									Media Gallery
								</h4>
								<ImageGallery images={allImages} />
							</div>
						)}

						<div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
							<span>ID: {post.id}</span>
							{post.updatedAt && post.updatedAt !== post.createdAt && (
								<span>Last Updated: {formatDate(post.updatedAt)}</span>
							)}
						</div>
					</div>
				</div>
			</motion.div>

			{/* ── Mobile Bottom Sheet (visible below sm) ── */}
			<motion.div
				initial={{ y: '100%' }}
				animate={{ y: 0 }}
				exit={{ y: '100%' }}
				transition={{ type: 'spring', damping: 30, stiffness: 300 }}
				className={cn(
					'fixed inset-x-0 bottom-0 z-10 flex flex-col sm:hidden',
					'max-h-[92vh] bg-card/80 backdrop-blur-2xl border-t border-border rounded-t-2xl shadow-2xl',
				)}
			>
				{/* Drag handle */}
				<div className="flex justify-center pt-3 pb-1 shrink-0">
					<div className="w-10 h-1 rounded-full bg-border" />
				</div>

				{/* Mobile Header */}
				<div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
					<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
						<BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--theme-secondary)' }} />
						<span>Article</span>
					</div>
					<div className="flex items-center gap-2">
						{post.link && (
							<a
								href={post.link}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95"
								style={{
									background: 'color-mix(in oklch, var(--theme-secondary) 10%, transparent)',
									color: 'var(--theme-secondary)',
									border: '1px solid color-mix(in oklch, var(--theme-secondary) 20%, transparent)',
								}}
							>
								<ExternalLink className="w-3 h-3" />
								Read
							</a>
						)}
						<button
							onClick={onClose}
							className="p-1.5 rounded-full bg-muted hover:bg-accent border border-border text-muted-foreground"
							aria-label="Close"
						>
							<X className="w-4 h-4" />
						</button>
					</div>
				</div>

				{/* Mobile Scrollable Body */}
				<div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
					{/* Compact cover */}
					{(post.coverImage || post.link) && (
						<div className="relative w-full aspect-video bg-muted overflow-hidden">
							{post.coverImage ? (
								<Image src={post.coverImage} alt={post.title ?? ''} fill sizes="100vw" className="object-cover" priority />
							) : (
								<UrlThumbnail url={post.link} title={post.title ?? ''} fallbackIcon={FileText} fallbackGradient="from-indigo-950/60" />
							)}
						</div>
					)}

					<div className="p-4 space-y-4 pb-10">
						{/* Meta */}
						<div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--theme-secondary)' }}>
							<span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted border border-border">
								<Calendar className="w-3 h-3" />
								{formatDate(post.publishedAt ?? post.createdAt)}
							</span>
							<span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted border border-border">
								<Clock className="w-3 h-3" />
								{readingTime(post.content)} min
							</span>
						</div>

						<h1 className="text-lg font-black text-foreground leading-tight tracking-tight">
							{post.title ?? 'Untitled'}
						</h1>

						{tags.length > 0 && (
							<div className="flex flex-wrap gap-1.5">
								{tags.map(tag => (
									<span
										key={tag}
										className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest"
										style={{
											background: 'color-mix(in oklch, var(--theme-secondary) 10%, transparent)',
											color: 'var(--theme-secondary)',
											border: '1px solid color-mix(in oklch, var(--theme-secondary) 20%, transparent)',
										}}
									>
										{tag}
									</span>
								))}
							</div>
						)}

						<div className="border-t border-border" />

						<article className="prose prose-invert prose-sm max-w-none text-foreground/80 leading-relaxed font-medium">
							<div className="whitespace-pre-wrap tracking-wide text-sm">
								{post.content ?? ''}
							</div>
						</article>

						{/* Mobile CTA to original post */}
						{post.link && (
							<a
								href={post.link}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
								style={{
									background: 'color-mix(in oklch, var(--theme-secondary) 12%, transparent)',
									color: 'var(--theme-secondary)',
									border: '1px solid color-mix(in oklch, var(--theme-secondary) 25%, transparent)',
								}}
							>
								<ExternalLink className="w-4 h-4" />
								Read Original Post
							</a>
						)}
					</div>
				</div>
			</motion.div>
		</div>
	);
}

// ─── Main Module ────────────────────────────────────────────────

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
		return () => { cancelled = true; };
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
				<SectionHeader
					label="Insights"
					icon={BookOpen}
					title="Engineering Log"
					description="Thoughts, tutorials, and deep dives into software engineering, systems design, and technology."
					sectionId="blog"
				/>

				{posts.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-24 mt-4 text-muted-foreground border border-dashed border-border rounded-2xl bg-card/50">
						<div className="p-4 rounded-full bg-foreground/5 mb-6 shadow-inner">
							<BookOpen className="w-8 h-8 text-muted-foreground/50" />
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
