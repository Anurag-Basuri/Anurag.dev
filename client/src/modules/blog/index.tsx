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
import { staggerContainer, staggerItem, fadeIn, scaleIn, fadeInUp } from '@/animations/motion';
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
			month: 'long',
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
			{ label: 'year', seconds: 31536000 },
			{ label: 'month', seconds: 2592000 },
			{ label: 'week', seconds: 604800 },
			{ label: 'day', seconds: 86400 },
		];
		for (const { label, seconds: s } of intervals) {
			const count = Math.floor(seconds / s);
			if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
		}
		return 'Just now';
	} catch {
		return '';
	}
}

// ─── Skeleton ───────────────────────────────────────────────────

function BlogSkeleton() {
	return (
		<div className="p-4 sm:p-6 md:p-12 space-y-8 animate-pulse max-w-7xl mx-auto">
			<div className="h-10 bg-muted rounded w-64 mb-8" />
			<div className="h-56 sm:h-72 md:h-[360px] lg:h-[420px] bg-card/10 rounded-2xl sm:rounded-3xl border border-white/5" />
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
				{[1, 2, 3].map(i => (
					<div key={i} className="h-72 sm:h-80 bg-card/10 rounded-2xl sm:rounded-3xl border border-white/5" />
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
			<div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-black">
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
							className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/80 transition-all"
							aria-label="Previous image"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						<button
							onClick={() => setCurrent(p => (p + 1) % images.length)}
							className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/80 transition-all"
							aria-label="Next image"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
						<div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
							{images.map((_, i) => (
								<button
									key={i}
									onClick={() => setCurrent(i)}
									className={cn(
										'h-2 rounded-full transition-all',
										i === current ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/50 w-2',
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
			variants={fadeInUp}
			initial="hidden"
			animate="visible"
			onClick={onClick}
			role="button"
			tabIndex={0}
			onKeyDown={e => e.key === 'Enter' && onClick()}
			className="group relative rounded-2xl sm:rounded-4xl lg:rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500 cursor-pointer hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.08)] focus-visible:ring-2 focus-visible:ring-primary/50 outline-none"
		>
			<div className="relative h-56 sm:h-72 md:h-[360px] lg:h-[420px] w-full bg-[#050505]">
				<UrlThumbnail
					url={post.coverImage || post.link}
					title={post.title ?? 'Blog post'}
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
					imgClassName="object-cover transition-transform duration-700 group-hover:scale-105"
					priority
					fallbackIcon={BookOpen}
				/>

				{/* Gradient overlay */}
				<div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />

				{/* Badge */}
				<div className="absolute top-4 left-4 sm:top-6 sm:left-6">
					<span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/30 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary">
						Latest
					</span>
				</div>

				{/* External link */}
				{post.link && (
					<a
						href={post.link}
						target="_blank"
						rel="noopener noreferrer"
						onClick={e => e.stopPropagation()}
						className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/60 hover:text-primary hover:border-primary/30 transition-all"
						aria-label="Open external link"
					>
						<ExternalLink className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
					</a>
				)}

				{/* Content */}
				<div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12">
					<div className="max-w-3xl">
						<div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-[10px] sm:text-xs text-white/50">
							<span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
								<Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
								{formatDate(post.publishedAt ?? post.createdAt)}
							</span>
							<span className="w-1 h-1 rounded-full bg-white/20" />
							<span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
								<Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
								{readingTime(post.content)} min read
							</span>
						</div>

						<h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight mb-2 sm:mb-4 group-hover:text-primary transition-colors duration-300 line-clamp-2">
							{post.title ?? 'Untitled'}
						</h2>

						<p className="text-xs sm:text-sm md:text-base text-white/60 line-clamp-2 leading-relaxed mb-4 sm:mb-6 max-w-2xl hidden sm:block">
							{post.content ?? ''}
						</p>

						{tags.length > 0 && (
							<div className="flex-wrap gap-1.5 sm:gap-2 hidden sm:flex">
								{tags.slice(0, 5).map(tag => (
									<span
										key={tag}
										className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-white/5 backdrop-blur-md text-white/60 border border-white/10"
									>
										{tag}
									</span>
								))}
							</div>
						)}
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
			onKeyDown={e => e.key === 'Enter' && onClick()}
			className="group relative flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 hover:border-primary/30 transition-all duration-500 cursor-pointer hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.06)] hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-primary/50 outline-none"
		>
			{/* Thumbnail */}
			<div className="relative aspect-16/10 overflow-hidden bg-[#050505]">
				<UrlThumbnail
					url={post.coverImage || post.link}
					title={post.title ?? 'Blog post'}
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					fallbackIcon={FileText}
				/>

				{/* External link icon */}
				{post.link && (
					<a
						href={post.link}
						target="_blank"
						rel="noopener noreferrer"
						onClick={e => e.stopPropagation()}
						className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/50 hover:text-primary hover:border-primary/30 transition-all z-10"
						aria-label="Open external link"
					>
						<ExternalLink className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
					</a>
				)}

				{/* Hover overlay */}
				<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
					<span className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">
						Read More
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="flex flex-col grow p-4 sm:p-6">
				<div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2 sm:mb-3">
					<span>{timeAgo(post.publishedAt ?? post.createdAt)}</span>
					<span className="w-1 h-1 rounded-full bg-white/20" />
					<span>{readingTime(post.content)} min</span>
				</div>

				<h3 className="text-base sm:text-lg font-bold text-white leading-snug tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
					{post.title ?? 'Untitled'}
				</h3>

				<p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3 sm:mb-4">
					{post.content ?? ''}
				</p>

				{/* Tags */}
				<div className="mt-auto flex flex-wrap gap-1.5 pt-3 sm:pt-4 border-t border-white/5">
					{tags.slice(0, 3).map(tag => (
						<span
							key={tag}
							className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[8px] sm:text-[9px] uppercase font-bold tracking-wider bg-black/50 text-muted-foreground border border-white/5 group-hover:border-primary/20 transition-colors"
						>
							{tag}
						</span>
					))}
					{tags.length > 3 && (
						<span className="px-2 py-0.5 sm:py-1 rounded-md text-[8px] sm:text-[9px] font-bold text-muted-foreground">
							+{tags.length - 3}
						</span>
					)}
				</div>
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

	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4 md:p-8">
			{/* Backdrop */}
			<motion.div
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				exit="hidden"
				onClick={onClose}
				className="absolute inset-0 bg-black/85 backdrop-blur-2xl"
			/>

			{/* Modal */}
			<motion.div
				variants={scaleIn}
				initial="hidden"
				animate="visible"
				exit="hidden"
				className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] bg-[#080808] border border-white/10 rounded-2xl sm:rounded-4xl lg:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col z-10"
			>
				{/* Close */}
				<button
					onClick={onClose}
					className="absolute top-3 right-3 sm:top-5 sm:right-5 z-50 p-2 sm:p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all hover:rotate-90"
					aria-label="Close modal"
				>
					<X className="w-4 sm:w-5 h-4 sm:h-5" />
				</button>

				<ScrollArea className="h-full">
					<div className="flex flex-col">
						{/* Hero Cover */}
						{post.coverImage && (
							<div className="relative w-full h-48 sm:h-56 md:h-72 lg:h-80 shrink-0">
								<Image
									src={post.coverImage}
									alt={post.title ?? 'Blog post'}
									fill
									sizes="(max-width: 768px) 100vw, 800px"
									className="object-cover"
									priority
								/>
								<div className="absolute inset-0 bg-linear-to-t from-[#080808] via-[#080808]/40 to-transparent" />
							</div>
						)}

						{/* Content */}
						<div
							className={cn(
								'p-4 sm:p-6 md:p-8 lg:p-12 space-y-6 sm:space-y-8',
								post.coverImage ? '-mt-12 sm:-mt-16 relative z-10' : '',
							)}
						>
							{/* Meta */}
							<div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
								<span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
									<Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary" />
									{formatDate(post.publishedAt ?? post.createdAt)}
								</span>
								<span className="w-1 h-1 rounded-full bg-white/20" />
								<span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
									<Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary" />
									{readingTime(post.content)} min read
								</span>
								{post.updatedAt && post.updatedAt !== post.createdAt && (
									<>
										<span className="w-1 h-1 rounded-full bg-white/20" />
										<span className="font-bold uppercase tracking-wider text-muted-foreground/60">
											Updated {timeAgo(post.updatedAt)}
										</span>
									</>
								)}
							</div>

							{/* Title */}
							<h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
								{post.title ?? 'Untitled'}
							</h1>

							{/* Tags */}
							{tags.length > 0 && (
								<div className="flex flex-wrap gap-1.5 sm:gap-2">
									{tags.map(tag => (
										<span
											key={tag}
											className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-primary/5 text-primary/80 border border-primary/10"
										>
											<Tag className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
											{tag}
										</span>
									))}
								</div>
							)}

							{/* Image Gallery */}
							{allImages.length > 1 && <ImageGallery images={allImages} />}

							{/* Article body */}
							<div className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
								{post.content ?? ''}
							</div>

							{/* External Link */}
							{post.link && (
								<div className="pt-4 sm:pt-6 border-t border-white/5">
									<a
										href={post.link}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary text-xs sm:text-sm font-bold uppercase tracking-wider transition-all group/link"
									>
										<ExternalLink className="w-3.5 sm:w-4 h-3.5 sm:h-4 group-hover/link:rotate-12 transition-transform" />
										Read on Original Platform
										<ArrowUpRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 opacity-50 group-hover/link:opacity-100 transition-opacity" />
									</a>
								</div>
							)}

							{/* Footer */}
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-4 sm:pt-6 border-t border-white/5 text-[9px] sm:text-[10px] text-muted-foreground/40 font-mono uppercase tracking-wider">
								<span>/{post.slug ?? ''}</span>
								{post.publishedAt && <span>Published {formatDate(post.publishedAt)}</span>}
							</div>
						</div>
					</div>
				</ScrollArea>
			</motion.div>
		</div>
	);
}

// ─── Main Module ────────────────────────────────────────────────

export function BlogModule() {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
	const [activeTag, setActiveTag] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		async function fetchPosts() {
			try {
				const { data } = await publicService.getBlogPosts();
				if (!cancelled) setPosts(data || []);
			} catch (err) {
				console.error('Failed to load blog posts', err);
				if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load posts');
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		fetchPosts();
		return () => { cancelled = true; };
	}, []);

	const allTags = useMemo(() => {
		const tagSet = new Set<string>();
		posts.forEach(p => safeArray(p.tags).forEach(t => tagSet.add(t)));
		return Array.from(tagSet).sort();
	}, [posts]);

	const filteredPosts = useMemo(() => {
		const q = searchQuery.toLowerCase();
		return posts.filter(p => {
			const pTags = safeArray(p.tags);
			const matchesSearch =
				!q ||
				(p.title ?? '').toLowerCase().includes(q) ||
				(p.content ?? '').toLowerCase().includes(q) ||
				pTags.some(t => t.toLowerCase().includes(q));
			const matchesTag = !activeTag || pTags.includes(activeTag);
			return matchesSearch && matchesTag;
		});
	}, [posts, searchQuery, activeTag]);

	const [featured, ...rest] = filteredPosts;

	const handleSelectPost = useCallback((post: BlogPost) => setSelectedPost(post), []);
	const handleCloseModal = useCallback(() => setSelectedPost(null), []);

	if (loading) return <BlogSkeleton />;

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-8 text-center">
				<div className="p-4 rounded-full bg-rose-500/10 mb-4">
					<BookOpen className="w-8 h-8 text-rose-400" />
				</div>
				<p className="text-muted-foreground mb-2">Failed to load blog posts</p>
				<p className="text-xs text-muted-foreground/60 mb-6">{error}</p>
				<button
					onClick={() => window.location.reload()}
					className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-colors"
				>
					Retry
				</button>
			</div>
		);
	}

	return (
		<ScrollArea className="h-full w-full">
			<div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto pb-24 sm:pb-32">
				{/* Header */}
				<SectionHeader
					label="Insights"
					icon={BookOpen}
					title="Engineering Log"
					description="Thoughts, tutorials, and deep dives into software engineering, systems design, and technology."
					actions={
						<div className="relative group w-full sm:w-72 md:w-80 mt-4 md:mt-0">
							<div className="absolute inset-0 bg-primary/10 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
							<Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
							<input
								type="text"
								placeholder="Search articles..."
								value={searchQuery}
								onChange={e => {
									setSearchQuery(e.target.value);
									setActiveTag(null);
								}}
								className="relative z-10 w-full bg-black/40 border border-white/10 rounded-xl sm:rounded-2xl pl-10 sm:pl-12 pr-4 sm:pr-6 py-2.5 sm:py-3.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:bg-black/60 transition-all placeholder:text-muted-foreground/50 backdrop-blur-xl shadow-inner"
							/>
						</div>
					}
				/>

				{/* Tag Filters */}
				{allTags.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="flex flex-wrap gap-1.5 sm:gap-2 mb-8 sm:mb-10 -mx-1 px-1 overflow-x-auto"
					>
						<button
							onClick={() => setActiveTag(null)}
							className={cn(
								'px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border transition-all duration-300 shrink-0',
								!activeTag
									? 'bg-primary/10 border-primary/30 text-primary'
									: 'bg-black/30 border-white/5 text-muted-foreground hover:border-white/20 hover:text-white',
							)}
						>
							All
						</button>
						{allTags.map(tag => (
							<button
								key={tag}
								onClick={() => setActiveTag(activeTag === tag ? null : tag)}
								className={cn(
									'px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border transition-all duration-300 shrink-0',
									activeTag === tag
										? 'bg-primary/10 border-primary/30 text-primary'
										: 'bg-black/30 border-white/5 text-muted-foreground hover:border-white/20 hover:text-white',
								)}
							>
								{tag}
							</button>
						))}
					</motion.div>
				)}

				{filteredPosts.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 sm:py-32 mt-4 text-muted-foreground border border-dashed border-white/10 rounded-2xl sm:rounded-[2.5rem] bg-[#0a0a0a]/50">
						<div className="p-3 sm:p-4 rounded-full bg-white/5 mb-4 sm:mb-6">
							<Search className="w-6 sm:w-8 h-6 sm:h-8 opacity-50 text-primary" />
						</div>
						<p className="text-base sm:text-lg px-4 text-center">
							No articles found
							{searchQuery && (
								<>
									{' '}matching{' '}
									<span className="text-white">&ldquo;{searchQuery}&rdquo;</span>
								</>
							)}
						</p>
						<button
							onClick={() => {
								setSearchQuery('');
								setActiveTag(null);
							}}
							className="mt-4 sm:mt-6 text-sm text-primary hover:text-white transition-colors uppercase tracking-wider font-bold"
						>
							Clear Filters
						</button>
					</div>
				) : (
					<div className="space-y-8 sm:space-y-10">
						{/* Featured (latest) post */}
						{featured && (
							<FeaturedCard post={featured} onClick={() => handleSelectPost(featured)} />
						)}

						{/* Grid of remaining posts */}
						{rest.length > 0 && (
							<motion.div
								variants={staggerContainer}
								initial="hidden"
								animate="visible"
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
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
		</ScrollArea>
	);
}
