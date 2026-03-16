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
					<div className="h-6 w-32 bg-white/5 rounded-lg" />
					<div className="h-12 w-64 bg-white/5 rounded-xl" />
					<div className="h-5 w-80 bg-white/5 rounded-lg hidden sm:block" />
				</div>
				<div className="h-12 w-full md:w-80 bg-white/5 rounded-2xl" />
			</div>

			<div className="h-[400px] mb-8 bg-white/5 rounded-[2.5rem]" />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 auto-rows-fr">
				{[1, 2, 3].map(i => (
					<div key={i} className="h-96 bg-white/5 rounded-[2.5rem]" />
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
			<div className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-black">
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
							className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/80 hover:scale-110 transition-all"
							aria-label="Previous image"
						>
							<ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
						</button>
						<button
							onClick={() => setCurrent(p => (p + 1) % images.length)}
							className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/80 hover:scale-110 transition-all"
							aria-label="Next image"
						>
							<ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
						</button>
						<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
							{images.map((_, i) => (
								<button
									key={i}
									onClick={() => setCurrent(i)}
									className={cn(
										'h-2 rounded-full transition-all duration-300',
										i === current
											? 'bg-indigo-400 w-8'
											: 'bg-white/40 hover:bg-white/70 w-2',
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
			className="group relative rounded-4xl sm:rounded-[2.5rem] overflow-hidden bg-linear-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 hover:border-indigo-500/40 transition-all duration-500 cursor-pointer shadow-2xl mb-8 sm:mb-12"
		>
			<div className="absolute inset-0 bg-linear-to-br from-indigo-500/0 to-transparent group-hover:from-indigo-500/10 transition-colors duration-500 pointer-events-none" />

			<div className="relative h-64 sm:h-80 md:h-[400px] lg:h-[450px] w-full bg-[#050505]">
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
					<span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-indigo-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/30">
						Latest
					</span>
					{tags.slice(0, 2).map(tag => (
						<span
							key={tag}
							className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/70 hidden sm:block"
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
						className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/60 hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all z-20"
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

						<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-3 sm:mb-5 group-hover:text-indigo-100 transition-colors duration-300 line-clamp-2">
							{post.title ?? 'Untitled'}
						</h2>

						<p className="text-sm md:text-base text-white/60 line-clamp-2 leading-relaxed font-medium max-w-2xl hidden sm:block">
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
			className="group relative flex flex-col h-full rounded-4xl overflow-hidden bg-linear-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 hover:border-indigo-500/40 transition-all duration-500 cursor-pointer shadow-2xl focus-visible:ring-2 focus-visible:ring-primary/50 outline-none"
		>
			<div className="absolute inset-0 bg-linear-to-br from-indigo-500/0 to-transparent group-hover:from-indigo-500/10 transition-colors duration-500 pointer-events-none" />

			{/* Thumbnail */}
			<div className="relative aspect-16/10 overflow-hidden mx-3 mt-3 rounded-t-3xl border border-white/5 bg-[#050505]">
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
						className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white/50 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all z-20 group/link"
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

				<h3 className="text-xl font-black text-white leading-tight tracking-tight mb-3 group-hover:text-indigo-100 transition-colors line-clamp-2">
					{post.title ?? 'Untitled'}
				</h3>

				<p className="text-sm text-white/60 line-clamp-2 leading-relaxed mb-6 font-medium">
					{post.content ?? ''}
				</p>

				{/* Tags */}
				{(tags ?? []).length > 0 && (
					<div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-white/5">
						{tags.slice(0, 3).map(tag => (
							<span
								key={tag}
								className="px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest bg-[#0a0a0a] border border-white/10 text-white/70 shadow-xl group-hover:border-indigo-500/20 group-hover:text-indigo-400 transition-colors"
							>
								{tag}
							</span>
						))}
						{tags.length > 3 && (
							<span className="px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest bg-[#0a0a0a] border border-white/10 text-white/40 shadow-xl">
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
				className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[85vh] bg-[#080808] border border-white/10 rounded-4xl lg:rounded-[2.5rem] shadow-3xl shadow-indigo-500/10 overflow-hidden flex flex-col z-10"
			>
				{/* Close */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all hover:rotate-90 hover:scale-110"
					aria-label="Close modal"
				>
					<X className="w-5 h-5" />
				</button>

				<ScrollArea className="h-full">
					<div className="flex flex-col relative pb-24">
						{/* Hero Cover */}
						{post.coverImage && (
							<div className="relative w-full h-56 sm:h-72 md:h-80 lg:h-96 shrink-0 border-b border-white/5">
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
								'p-6 sm:p-8 md:p-12 lg:p-14 space-y-8 sm:space-y-10',
								post.coverImage ? '-mt-16 sm:-mt-24 relative z-10' : 'pt-12',
							)}
						>
							{/* Meta */}
							<div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-indigo-400">
								<span className="flex items-center gap-1.5 font-bold uppercase tracking-widest px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg backdrop-blur-md shadow-inner">
									<Calendar className="w-3.5 h-3.5" />
									{formatDate(post.publishedAt ?? post.createdAt)}
								</span>
								<span className="flex items-center gap-1.5 font-bold uppercase tracking-widest px-3 py-1.5 bg-white/5 border border-white/10 text-white/70 rounded-lg backdrop-blur-md shadow-inner">
									<Clock className="w-3.5 h-3.5" />
									{readingTime(post.content)} min read
								</span>
								{post.updatedAt && post.updatedAt !== post.createdAt && (
									<span className="font-bold uppercase tracking-widest text-muted-foreground/60">
										Updated {timeAgo(post.updatedAt)}
									</span>
								)}
							</div>

							{/* Title */}
							<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
								{post.title ?? 'Untitled'}
							</h1>

							{/* Tags */}
							{tags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{tags.map(tag => (
										<span
											key={tag}
											className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] uppercase font-black tracking-widest bg-[#111] text-white/80 border border-white/10 shadow-inner"
										>
											<Tag className="w-3 h-3 text-indigo-400" />
											{tag}
										</span>
									))}
								</div>
							)}

							{/* External Link */}
							{post.link && (
								<div className="pt-2">
									<a
										href={post.link}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 text-xs font-bold uppercase tracking-wider transition-all group/link shadow-lg w-full sm:w-auto justify-center"
									>
										<BookOpen className="w-4 h-4" />
										Read Original Article Here
										<ArrowUpRight className="w-4 h-4 opacity-50 group-hover/link:opacity-100 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-all" />
									</a>
								</div>
							)}

							{/* Article body */}
							<div className="text-white/80 leading-loose whitespace-pre-wrap text-sm sm:text-base font-medium">
								{post.content ?? ''}
							</div>

							{/* Image Gallery */}
							{allImages.length > 1 && (
								<div className="pt-8 border-t border-white/5">
									<h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-6">
										Article Media
									</h4>
									<ImageGallery images={allImages} />
								</div>
							)}

							{/* Footer Meta Details Component */}
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-10 border-t border-white/5 text-[10px] text-muted-foreground/50 font-mono uppercase tracking-widest font-bold">
								<span>/{post.slug ?? ''}</span>
								{post.publishedAt && (
									<span>Published {formatDate(post.publishedAt)}</span>
								)}
							</div>
						</div>

						{/* Scroll indicator fade */}
						<div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#080808] via-[#080808]/90 to-transparent pointer-events-none" />
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
			<div className="flex flex-col items-center justify-center py-32 text-center max-w-7xl mx-auto">
				<div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-6 shadow-inner shadow-rose-500/20">
					<BookOpen className="w-8 h-8 text-rose-400" />
				</div>
				<p className="text-xl font-bold text-white mb-2 tracking-tight">
					Failed to load articles
				</p>
				<p className="text-sm text-white/50 mb-8 max-w-sm">{error}</p>
				<button
					onClick={() => window.location.reload()}
					className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 shadow-lg"
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="h-full w-full">
			<div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto pb-24 sm:pb-32">
				{/* Header */}
				<SectionHeader
					label="Insights"
					icon={BookOpen}
					title="Engineering Log"
					description="Thoughts, tutorials, and deep dives into software engineering, systems design, and technology."
					accent="indigo"
					actions={
						<div className="relative group w-full sm:w-72 md:w-80 mt-6 sm:mt-0">
							<div className="absolute inset-0 bg-indigo-500/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-indigo-400 transition-colors z-20 pointer-events-none" />
							<input
								type="text"
								placeholder="Search articles..."
								value={searchQuery}
								onChange={e => {
									setSearchQuery(e.target.value);
									setActiveTag(null);
								}}
								className="relative z-10 w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 focus:bg-black/60 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-white/30 backdrop-blur-xl shadow-inner shadow-indigo-500/5"
							/>
						</div>
					}
				/>

				{/* Tag Filters */}
				{allTags.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}
						className="flex flex-wrap gap-2 mb-10 overflow-x-auto hide-scrollbar mt-6 sm:mt-8 pb-2"
					>
						<button
							onClick={() => setActiveTag(null)}
							className={cn(
								'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 shrink-0 outline-none',
								!activeTag
									? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-inner'
									: 'bg-[#0a0a0a] border-white/5 text-white/40 hover:border-white/20 hover:text-white hover:bg-white/5',
							)}
						>
							All Details
						</button>
						{allTags.map(tag => (
							<button
								key={tag}
								onClick={() => setActiveTag(activeTag === tag ? null : tag)}
								className={cn(
									'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 shrink-0 outline-none',
									activeTag === tag
										? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-inner'
										: 'bg-[#0a0a0a] border-white/5 text-white/40 hover:border-white/20 hover:text-white hover:bg-white/5',
								)}
							>
								{tag}
							</button>
						))}
					</motion.div>
				)}

				{filteredPosts.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-24 mt-4 text-muted-foreground border border-dashed border-white/10 rounded-[2.5rem] bg-[#0a0a0a]/50">
						<div className="p-4 rounded-full bg-white/5 mb-6 shadow-inner">
							<Search className="w-8 h-8 text-indigo-400/50" />
						</div>
						<p className="text-lg font-medium text-white/80 px-4 text-center">
							No articles found
							{searchQuery && (
								<>
									{' '}
									matching{' '}
									<span className="text-white font-bold">
										&ldquo;{searchQuery}&rdquo;
									</span>
								</>
							)}
						</p>
						<button
							onClick={() => {
								setSearchQuery('');
								setActiveTag(null);
							}}
							className="mt-6 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white uppercase tracking-wider font-bold transition-all"
						>
							Clear Filters
						</button>
					</div>
				) : (
					<div className="space-y-4">
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
								className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 auto-rows-fr"
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
