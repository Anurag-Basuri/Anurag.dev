'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { cn } from '@/lib/utils';

// ─── Helpers ────────────────────────────────────────────────────

function readingTime(content: string): number {
	return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function formatDate(date: string | null | undefined): string {
	if (!date) return '';
	return new Date(date).toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

function timeAgo(date: string | null | undefined): string {
	if (!date) return '';
	const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
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
}

// ─── Skeleton ───────────────────────────────────────────────────

function BlogSkeleton() {
	return (
		<div className="p-8 space-y-8 animate-pulse max-w-7xl mx-auto">
			<div className="h-10 bg-muted rounded w-64 mb-8" />
			<div className="h-[420px] bg-card/10 rounded-[2.5rem] border border-white/5" />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[1, 2, 3].map(i => (
					<div key={i} className="h-80 bg-card/10 rounded-3xl border border-white/5" />
				))}
			</div>
		</div>
	);
}

// ─── Image Gallery ──────────────────────────────────────────────

function ImageGallery({ images }: { images: string[] }) {
	const [current, setCurrent] = useState(0);
	if (images.length === 0) return null;

	return (
		<div className="space-y-3">
			<div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
				<Image
					src={images[current]}
					alt={`Image ${current + 1}`}
					fill
					className="object-cover"
				/>
				{images.length > 1 && (
					<>
						<button
							onClick={() => setCurrent(p => (p - 1 + images.length) % images.length)}
							className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/80 transition-all"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						<button
							onClick={() => setCurrent(p => (p + 1) % images.length)}
							className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/80 transition-all"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
						<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
							{images.map((_, i) => (
								<button
									key={i}
									onClick={() => setCurrent(i)}
									className={cn(
										'w-2 h-2 rounded-full transition-all',
										i === current ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/50',
									)}
								/>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}

// ─── Featured Card (latest post, large) ─────────────────────────

function FeaturedCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
	return (
		<motion.article
			variants={fadeInUp}
			initial="hidden"
			animate="visible"
			onClick={onClick}
			className="group relative rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500 cursor-pointer hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.08)]"
		>
			<div className="relative h-[420px] w-full bg-[#050505]">
				{post.coverImage ? (
					<Image
						src={post.coverImage}
						alt={post.title}
						fill
						className="object-cover transition-transform duration-700 group-hover:scale-105"
					/>
				) : (
					<div className="w-full h-full bg-linear-to-br from-[#111] via-[#080808] to-black flex items-center justify-center">
						<BookOpen className="w-20 h-20 text-white/5" />
					</div>
				)}

				{/* Gradient overlay */}
				<div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />

				{/* Badge */}
				<div className="absolute top-6 left-6">
					<span className="px-4 py-2 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/30 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
						Latest
					</span>
				</div>

				{/* External link badge */}
				{post.link && (
					<a
						href={post.link}
						target="_blank"
						rel="noopener noreferrer"
						onClick={e => e.stopPropagation()}
						className="absolute top-6 right-6 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/60 hover:text-primary hover:border-primary/30 transition-all"
					>
						<ExternalLink className="w-4 h-4" />
					</a>
				)}

				{/* Content */}
				<div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
					<div className="max-w-3xl">
						<div className="flex items-center gap-4 mb-4 text-xs text-white/50">
							<span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
								<Calendar className="w-3.5 h-3.5" />
								{formatDate(post.publishedAt || post.createdAt)}
							</span>
							<span className="w-1 h-1 rounded-full bg-white/20" />
							<span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
								<Clock className="w-3.5 h-3.5" />
								{readingTime(post.content)} min read
							</span>
						</div>

						<h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight mb-4 group-hover:text-primary transition-colors duration-300">
							{post.title}
						</h2>

						<p className="text-sm md:text-base text-white/60 line-clamp-2 leading-relaxed mb-6 max-w-2xl">
							{post.content}
						</p>

						{post.tags.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{post.tags.slice(0, 5).map(tag => (
									<span
										key={tag}
										className="px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider bg-white/5 backdrop-blur-md text-white/60 border border-white/10"
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
}

// ─── Post Card (grid item) ──────────────────────────────────────

function PostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
	return (
		<motion.article
			variants={staggerItem}
			layout
			onClick={onClick}
			className="group relative flex flex-col rounded-3xl overflow-hidden bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 hover:border-primary/30 transition-all duration-500 cursor-pointer hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.06)] hover:-translate-y-1"
		>
			{/* Thumbnail */}
			<div className="relative aspect-[16/10] overflow-hidden bg-[#050505]">
				{post.coverImage ? (
					<Image
						src={post.coverImage}
						alt={post.title}
						fill
						className="object-cover transition-transform duration-700 group-hover:scale-110"
					/>
				) : (
					<div className="w-full h-full bg-linear-to-br from-[#111] via-[#080808] to-black flex items-center justify-center">
						<FileText className="w-10 h-10 text-white/5 group-hover:text-primary/20 transition-colors duration-500" />
					</div>
				)}

				{/* External link icon on card */}
				{post.link && (
					<a
						href={post.link}
						target="_blank"
						rel="noopener noreferrer"
						onClick={e => e.stopPropagation()}
						className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/50 hover:text-primary hover:border-primary/30 transition-all z-10"
					>
						<ExternalLink className="w-3.5 h-3.5" />
					</a>
				)}

				{/* Hover overlay */}
				<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
					<span className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
						Read More
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="flex flex-col grow p-6">
				<div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3">
					<span>{timeAgo(post.publishedAt || post.createdAt)}</span>
					<span className="w-1 h-1 rounded-full bg-white/20" />
					<span>{readingTime(post.content)} min</span>
				</div>

				<h3 className="text-lg font-bold text-white leading-snug tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
					{post.title}
				</h3>

				<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
					{post.content}
				</p>

				{/* Tags */}
				<div className="mt-auto flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
					{post.tags.slice(0, 3).map(tag => (
						<span
							key={tag}
							className="px-2.5 py-1 rounded-md text-[9px] uppercase font-bold tracking-wider bg-black/50 text-muted-foreground border border-white/5 group-hover:border-primary/20 transition-colors"
						>
							{tag}
						</span>
					))}
					{post.tags.length > 3 && (
						<span className="px-2.5 py-1 rounded-md text-[9px] font-bold text-muted-foreground">
							+{post.tags.length - 3}
						</span>
					)}
				</div>
			</div>
		</motion.article>
	);
}

// ─── Detail Modal ───────────────────────────────────────────────

function BlogDetailModal({ post, onClose }: { post: BlogPost; onClose: () => void }) {
	const allImages = [
		...(post.coverImage ? [post.coverImage] : []),
		...(post.otherImages || []),
	];

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
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
				className="relative w-full max-w-4xl max-h-[90vh] bg-[#080808] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col z-10"
			>
				{/* Close */}
				<button
					onClick={onClose}
					className="absolute top-5 right-5 z-50 p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all hover:rotate-90"
				>
					<X className="w-5 h-5" />
				</button>

				<ScrollArea className="h-full">
					<div className="flex flex-col">
						{/* Hero Cover */}
						{post.coverImage && (
							<div className="relative w-full h-64 md:h-80 shrink-0">
								<Image
									src={post.coverImage}
									alt={post.title}
									fill
									className="object-cover"
								/>
								<div className="absolute inset-0 bg-linear-to-t from-[#080808] via-[#080808]/40 to-transparent" />
							</div>
						)}

						{/* Content */}
						<div className={cn(
							'p-8 md:p-12 space-y-8',
							post.coverImage ? '-mt-16 relative z-10' : '',
						)}>
							{/* Meta */}
							<div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
								<span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
									<Calendar className="w-3.5 h-3.5 text-primary" />
									{formatDate(post.publishedAt || post.createdAt)}
								</span>
								<span className="w-1 h-1 rounded-full bg-white/20" />
								<span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
									<Clock className="w-3.5 h-3.5 text-primary" />
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
							<h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
								{post.title}
							</h1>

							{/* Tags */}
							{post.tags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{post.tags.map(tag => (
										<span
											key={tag}
											className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider bg-primary/5 text-primary/80 border border-primary/10"
										>
											<Tag className="w-3 h-3" />
											{tag}
										</span>
									))}
								</div>
							)}

							{/* Image Gallery (cover + otherImages) */}
							{allImages.length > 1 && <ImageGallery images={allImages} />}

							{/* Article body */}
							<div className="text-white/80 leading-relaxed whitespace-pre-wrap text-base">
								{post.content}
							</div>

							{/* External Link */}
							{post.link && (
								<div className="pt-6 border-t border-white/5">
									<a
										href={post.link}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary text-sm font-bold uppercase tracking-wider transition-all group/link"
									>
										<ExternalLink className="w-4 h-4 group-hover/link:rotate-12 transition-transform" />
										Read on Original Platform
										<ArrowUpRight className="w-4 h-4 opacity-50 group-hover/link:opacity-100 transition-opacity" />
									</a>
								</div>
							)}

							{/* Footer */}
							<div className="flex items-center justify-between pt-6 border-t border-white/5 text-[10px] text-muted-foreground/40 font-mono uppercase tracking-wider">
								<span>/{post.slug}</span>
								{post.publishedAt && (
									<span>Published {formatDate(post.publishedAt)}</span>
								)}
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
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
	const [activeTag, setActiveTag] = useState<string | null>(null);

	useEffect(() => {
		async function fetchPosts() {
			const { data } = await publicService.getBlogPosts();
			setPosts(data || []);
			setLoading(false);
		}
		fetchPosts();
	}, []);

	const allTags = useMemo(() => {
		const tagSet = new Set<string>();
		posts.forEach(p => p.tags.forEach(t => tagSet.add(t)));
		return Array.from(tagSet).sort();
	}, [posts]);

	const filteredPosts = useMemo(() => {
		return posts.filter(p => {
			const matchesSearch =
				!searchQuery ||
				p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
			const matchesTag = !activeTag || p.tags.includes(activeTag);
			return matchesSearch && matchesTag;
		});
	}, [posts, searchQuery, activeTag]);

	const [featured, ...rest] = filteredPosts;

	if (loading) return <BlogSkeleton />;

	return (
		<ScrollArea className="h-full w-full">
			<div className="p-6 md:p-12 max-w-7xl mx-auto pb-32">
				{/* Header */}
				<SectionHeader
					label="Insights"
					icon={BookOpen}
					title="Engineering Log"
					description="Thoughts, tutorials, and deep dives into software engineering, systems design, and technology."
					actions={
						<div className="relative group w-full md:w-80 mt-4 md:mt-0">
							<div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
							<input
								type="text"
								placeholder="Search articles..."
								value={searchQuery}
								onChange={e => {
									setSearchQuery(e.target.value);
									setActiveTag(null);
								}}
								className="relative z-10 w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:bg-black/60 transition-all placeholder:text-muted-foreground/50 backdrop-blur-xl shadow-inner"
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
						className="flex flex-wrap gap-2 mb-10"
					>
						<button
							onClick={() => setActiveTag(null)}
							className={cn(
								'px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all duration-300',
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
									'px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all duration-300',
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
					<div className="flex flex-col items-center justify-center py-32 mt-4 text-muted-foreground border border-dashed border-white/10 rounded-[2.5rem] bg-[#0a0a0a]/50">
						<div className="p-4 rounded-full bg-white/5 mb-6">
							<Search className="w-8 h-8 opacity-50 text-primary" />
						</div>
						<p className="text-lg">
							No articles found
							{searchQuery && (
								<>
									{' '}matching <span className="text-white">&ldquo;{searchQuery}&rdquo;</span>
								</>
							)}
						</p>
						<button
							onClick={() => {
								setSearchQuery('');
								setActiveTag(null);
							}}
							className="mt-6 text-sm text-primary hover:text-white transition-colors uppercase tracking-wider font-bold"
						>
							Clear Filters
						</button>
					</div>
				) : (
					<div className="space-y-10">
						{/* Featured (latest) post — large hero card */}
						{featured && (
							<FeaturedCard
								post={featured}
								onClick={() => setSelectedPost(featured)}
							/>
						)}

						{/* Remaining posts — 3-column grid */}
						{rest.length > 0 && (
							<motion.div
								variants={staggerContainer}
								initial="hidden"
								animate="visible"
								className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
							>
								{rest.map(post => (
									<PostCard
										key={post.id}
										post={post}
										onClick={() => setSelectedPost(post)}
									/>
								))}
							</motion.div>
						)}
					</div>
				)}

				{/* Detail Modal */}
				<AnimatePresence>
					{selectedPost && (
						<BlogDetailModal
							post={selectedPost}
							onClose={() => setSelectedPost(null)}
						/>
					)}
				</AnimatePresence>
			</div>
		</ScrollArea>
	);
}
