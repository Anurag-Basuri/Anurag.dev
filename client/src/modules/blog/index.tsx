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
		<div className="p-4 sm:p-6 md:p-12 space-y-8 animate-pulse max-w-7xl mx-auto pb-32">
			<div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 pb-8">
				<div className="space-y-4 w-full md:w-auto">
					<div className="h-6 w-32 bg-foreground/5 rounded-lg" />
					<div className="h-12 w-64 bg-foreground/5 rounded-xl" />
					<div className="h-5 w-80 bg-foreground/5 rounded-lg hidden sm:block" />
				</div>
				<div className="h-12 w-full md:w-80 bg-foreground/5 rounded-2xl" />
			</div>

			<div className="h-[400px] mb-8 bg-foreground/5 rounded-[2.5rem]" />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 auto-rows-fr">
				{[1, 2, 3].map(i => (
					<div key={i} className="h-96 bg-foreground/5 rounded-[2.5rem]" />
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
			<div className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden border border-border bg-black">
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

// ─── Featured Card (latest post, hero-sized) ────────────────────

const FeaturedCard = memo(function FeaturedCard({
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
			onClick={onClick}
			role="button"
			tabIndex={0}
			whileHover={cardHover}
			onKeyDown={e => e.key === 'Enter' && onClick()}
			className="group relative rounded-3xl overflow-hidden bg-linear-to-br from-white/5 to-transparent backdrop-blur-sm border border-border hover:border-indigo-500/40 transition-all duration-500 cursor-pointer shadow-2xl mb-8 sm:mb-12"
		>
			<div className="absolute inset-0 bg-linear-to-br from-indigo-500/0 to-transparent group-hover:from-indigo-500/10 transition-colors duration-500 pointer-events-none" />

			<div className="relative h-64 sm:h-80 md:h-[400px] lg:h-[450px] w-full bg-card">
				<UrlThumbnail
					url={post.coverImage || post.link}
					title={post.title ?? 'Blog post'}
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
					imgClassName="object-cover transition-transform duration-700 group-hover:scale-105"
					priority
					fallbackIcon={BookOpen}
					fallbackGradient="from-indigo-950/60"
				/>

				{/* Huge Bottom Gradient */}
				<div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent pointer-events-none" />

				{/* Badges/Tags over image */}
				<div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap gap-2 z-20">
					<span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-indigo-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-foreground shadow-lg shadow-indigo-500/30">
						Latest
					</span>
					{tags.slice(0, 2).map(tag => (
						<span
							key={tag}
							className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-background/50 backdrop-blur-md border border-border text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-foreground/70 hidden sm:block"
						>
							{tag}
						</span>
					))}
				</div>

				{/* Extra interaction hint */}
				{post.link && (
					<a
						href={post.link}
						target="_blank"
						rel="noopener noreferrer"
						onClick={e => e.stopPropagation()}
						className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 rounded-full bg-background/50 backdrop-blur-md border border-border text-muted-foreground hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all z-20"
						aria-label="Open external link"
					>
						<ExternalLink className="w-4 sm:w-5 h-4 sm:h-5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
					</a>
				)}

				{/* Content overlay */}
				<div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 lg:p-12 z-10 flex flex-col justify-end">
					<div className="max-w-4xl">
						<div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4 text-[10px] sm:text-xs text-indigo-300 font-bold uppercase tracking-wider">
							<span className="flex items-center gap-1.5">
								<Calendar className="w-3.5 h-3.5" />
								{formatDate(post.publishedAt ?? post.createdAt)}
							</span>
							<span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 hidden sm:block" />
							<span className="items-center gap-1.5 hidden sm:flex">
								<Clock className="w-3.5 h-3.5" />
								{readingTime(post.content)} min read
							</span>
						</div>

						<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-tight tracking-tight mb-3 sm:mb-5 group-hover:text-indigo-100 transition-colors duration-300 line-clamp-2">
							{post.title ?? 'Untitled'}
						</h2>

						<p className="text-sm md:text-base text-muted-foreground line-clamp-2 leading-relaxed font-medium max-w-2xl hidden sm:block">
							{post.content ?? ''}
						</p>
					</div>
				</div>
			</div>
		</motion.article>
	);
});

// ─── Post Card (grid item, memoized) ────────────────────────────

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
			className="group relative flex flex-col h-full rounded-3xl overflow-hidden bg-linear-to-br from-white/5 to-transparent backdrop-blur-sm border border-border hover:border-indigo-500/40 transition-all duration-500 cursor-pointer shadow-2xl focus-visible:ring-2 focus-visible:ring-primary/50 outline-none"
		>
			<div className="absolute inset-0 bg-linear-to-br from-indigo-500/0 to-transparent group-hover:from-indigo-500/10 transition-colors duration-500 pointer-events-none" />

			{/* Thumbnail */}
			<div className="relative aspect-16/10 overflow-hidden mx-3 mt-3 rounded-t-3xl border border-border bg-card">
				<UrlThumbnail
					url={post.coverImage || post.link}
					title={post.title ?? 'Blog post'}
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					fallbackIcon={FileText}
					fallbackGradient="from-indigo-950/60"
				/>

				{/* Inner shadow */}
				<div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-[#0a0a0a] to-transparent pointer-events-none" />

				{/* External link mini-icon */}
				{post.link && (
					<a
						href={post.link}
						target="_blank"
						rel="noopener noreferrer"
						onClick={e => e.stopPropagation()}
						className="absolute top-3 right-3 p-2 rounded-xl bg-background/60 backdrop-blur-md border border-border text-muted-foreground hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all z-20 group/link"
						aria-label="Open external link"
					>
						<ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
					</a>
				)}
			</div>

			{/* Content */}
			<div className="flex flex-col grow p-6 relative z-10 -mt-2">
				<div className="flex items-center gap-2 sm:gap-3 text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-3">
					<span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
					<span className="w-1 h-1 rounded-full bg-indigo-500/50" />
					<span>{readingTime(post.content)} min</span>
				</div>

				<h3 className="text-xl font-black text-foreground leading-tight tracking-tight mb-3 group-hover:text-indigo-100 transition-colors line-clamp-2">
					{post.title ?? 'Untitled'}
				</h3>

				<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-6 font-medium">
					{post.content ?? ''}
				</p>

				{/* Tags */}
				{(tags ?? []).length > 0 && (
					<div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-border">
						{tags.slice(0, 3).map(tag => (
							<span
								key={tag}
								className="px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest bg-card border border-border text-foreground/70 shadow-xl group-hover:border-indigo-500/20 group-hover:text-indigo-400 transition-colors"
							>
								{tag}
							</span>
						))}
						{tags.length > 3 && (
							<span className="px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest bg-card border border-border text-muted-foreground shadow-xl">
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
		<div className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
			{/* Backdrop */}
			<motion.div
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				exit="hidden"
				onClick={onClose}
				className="absolute inset-0 bg-background/90 backdrop-blur-3xl"
			/>

			{/* Modal Container */}
			<motion.div
				variants={scaleIn}
				initial="hidden"
				animate="visible"
				exit="hidden"
				className="relative w-full max-w-4xl h-[95vh] sm:h-[90vh] bg-card border border-border rounded-3xl sm:rounded-4xl shadow-2xl flex flex-col z-10 overflow-hidden"
			>
				{/* Top Bar with Progress */}
				<div className="absolute top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6 bg-linear-to-b from-[#050505] to-transparent pointer-events-none">
					{/* Progress Indicator Line */}
					<div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
						<div
							className="h-full bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-150"
							style={{ width: `${scrollProgress}%` }}
						/>
					</div>
				</div>

				{/* Floating Action Menu */}
				<div className="absolute top-6 right-6 z-50 flex items-center gap-3">
					{post.link && (
						<a
							href={post.link}
							target="_blank"
							rel="noopener noreferrer"
							title="Read Original Article"
							className="p-3 sm:px-5 sm:py-2.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs backdrop-blur-md transition-all flex items-center gap-2 shadow-xl group"
						>
							<BookOpen className="w-4 h-4" />
							<span className="hidden sm:inline">Original</span>
							<ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
						</a>
					)}
					<button
						onClick={onClose}
						className="p-3 rounded-full bg-background/50 hover:bg-foreground/10 border border-border text-foreground/70 hover:text-foreground backdrop-blur-md transition-all hover:rotate-90 hover:scale-105 shadow-xl"
						aria-label="Close article"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<ScrollArea
					className="h-full w-full custom-scrollbar"
					onScrollCapture={(e) => {
						const target = e.currentTarget;
						if (target) {
							const { scrollTop, scrollHeight, clientHeight } = target;
							const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
							setScrollProgress(Number.isNaN(progress) ? 0 : Math.min(progress, 100));
						}
					}}
				>
					<div className="flex flex-col relative pb-32">
						{/* Massive Hero Cover */}
						<div className="relative w-full h-[30vh] sm:h-[40vh] md:h-[50vh] shrink-0 bg-card">
							{post.coverImage ? (
								<>
									<Image
										src={post.coverImage}
										alt={post.title ?? 'Article cover'}
										fill
										sizes="100vw"
										className="object-cover"
										priority
									/>
									<div className="absolute inset-0 bg-linear-to-t from-[#050505] via-[#050505]/60 to-transparent" />
								</>
							) : (
								<div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-900/20 to-black">
									<FileText className="w-24 h-24 text-white/5" />
									<div className="absolute inset-0 bg-linear-to-t from-[#050505] to-transparent" />
								</div>
							)}
						</div>

						{/* Editorial Content Container */}
						<div className="relative z-10 mx-auto w-full max-w-[700px] px-6 sm:px-10 md:px-12 -mt-24 sm:-mt-32">
							{/* Header Meta */}
							<div className="mb-6 space-y-5">
								<div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-indigo-300">
									<span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-xl backdrop-blur-md">
										<Calendar className="w-3.5 h-3.5" />
										{formatDate(post.publishedAt ?? post.createdAt)}
									</span>
									<span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-xl backdrop-blur-md">
										<Clock className="w-3.5 h-3.5" />
										{readingTime(post.content)} min read
									</span>
								</div>

								<h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground leading-[1.15] tracking-tight drop-shadow-2xl">
									{post.title ?? 'Untitled Article'}
								</h1>
								
								{tags.length > 0 && (
									<div className="flex flex-wrap gap-2 pt-2">
										{tags.map(tag => (
											<span
												key={tag}
												className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner"
											>
												{tag}
											</span>
										))}
									</div>
								)}
							</div>

							{/* Main Body */}
							<article className="prose prose-invert prose-base md:prose-lg max-w-none text-foreground/80 leading-loose font-medium prose-headings:font-black prose-headings:tracking-tight prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-3xl prose-img:border prose-img:border-border">
								{/* 
									Since raw markdown isn't processed by a markdown parser here,
									we maintain the whitespace-pre-wrap but style it beautifully.
								*/}
								<div className="whitespace-pre-wrap tracking-wide text-sm md:text-base">
									{post.content ?? ''}
								</div>
							</article>

							{/* Image Gallery */}
							{allImages.length > 1 && (
								<div className="mt-16 pt-10 border-t border-border">
									<h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-8 flex items-center gap-3">
										<BookOpen className="w-4 h-4" />
										Article Media Gallery
									</h4>
									<ImageGallery images={allImages} />
								</div>
							)}

							{/* Footer Meta */}
							<div className="mt-16 sm:mt-24 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
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

	const [featured, ...rest] = posts;

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
				<p className="text-sm text-muted-foreground mb-8 max-w-sm">{error}</p>
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
			<div className="p-4 sm:p-5 md:p-8 max-w-5xl mx-auto pb-16 sm:pb-24">
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
					<div className="space-y-4 mt-8">
						{/* Featured (latest) post */}
						<motion.div
							variants={staggerContainer}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true }}
						>
							{featured && (
								<FeaturedCard
									post={featured}
									onClick={() => handleSelectPost(featured)}
								/>
							)}
						</motion.div>

						{/* Grid of remaining posts */}
						{rest.length > 0 && (
							<motion.div
								variants={staggerContainer}
								initial="hidden"
								whileInView="visible"
								viewport={{ once: true, margin: '-20px' }}
								className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 auto-rows-fr"
							>
								{rest.map(post => (
									<PostCard
										key={post.id}
										post={post}
										onClick={() => handleSelectPost(post)}
									/>
								))}
							</motion.div>
						)}
					</div>
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
