'use client';

import { useEffect, useState, useMemo } from 'react';
import { publicService } from '@/api';
import type { BlogPost } from '@/api/schema';
import {
	BookOpen,
	Calendar,
	Clock,
	ArrowUpRight,
	X,
	ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem, scaleIn, fadeIn } from '@/animations/motion';
import { SectionHeader } from '@/ui/SectionHeader';
import { Portal } from '@/ui/Portal';
import { cn } from '@/lib/utils';

function safeArray<T>(arr: T[] | null | undefined): T[] {
	return Array.isArray(arr) ? arr : [];
}

function readingTime(content: string | null | undefined): number {
	if (!content) return 2;
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

function BlogSkeleton() {
	return (
		<div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
			<div className="h-6 w-32 bg-foreground/5 rounded-md" />
			<div className="space-y-4">
				{[1, 2, 3].map(i => (
					<div key={i} className="h-44 bg-foreground/5 rounded-2xl" />
				))}
			</div>
		</div>
	);
}

export function BlogModule() {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

	useEffect(() => {
		let cancelled = false;
		async function fetchPosts() {
			try {
				const { data } = await publicService.getBlogPosts();
				if (!cancelled) setPosts(data || []);
			} catch (err) {
				console.error('Failed to load blog posts', err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		fetchPosts();
		return () => { cancelled = true; };
	}, []);

	if (loading && posts.length === 0) return <BlogSkeleton />;

	return (
		<div className="w-full min-h-full pb-20 sm:pb-28">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6">
				{/* 08 · Section Header */}
				<SectionHeader
					icon={BookOpen}
					index="08"
					tag="WRITINGS"
					title="Technical Insights"
					description="Engineering essays on AI systems, retrieval pipelines, and computational thinking."
					sectionId="blog"
				/>

				{posts.length === 0 ? (
					<div className="text-center py-20 border border-dashed border-border/40 rounded-2xl bg-card/10 mt-6">
						<p className="text-muted-foreground text-sm font-mono">No articles published yet.</p>
					</div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
						className="space-y-4 sm:space-y-6 mt-6"
					>
						{posts.map((post, idx) => {
							const tags = safeArray(post.tags);
							const dateStr = formatDate(post.publishedAt ?? post.createdAt);
							const readTimeMin = readingTime(post.content);

							return (
								<motion.article
									key={post.id || idx}
									variants={staggerItem}
									className="group rounded-2xl border border-border/40 bg-card/25 backdrop-blur-xl p-6 sm:p-8 hover:border-border/80 transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer"
									onClick={() => setSelectedPost(post)}
								>
									<div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-border/20">
										<div className="max-w-3xl">
											<div className="flex flex-wrap items-center gap-2 mb-2">
												<span className="font-mono text-xs text-primary/90 font-medium">
													// 0{idx + 1}
												</span>
												{dateStr && (
													<>
														<span className="text-border/60">·</span>
														<span className="text-xs font-mono text-muted-foreground/75">
															{dateStr}
														</span>
													</>
												)}
												<span className="text-border/60">·</span>
												<span className="text-xs font-mono text-muted-foreground/60">
													{readTimeMin} min read
												</span>
											</div>

											<h3 className="text-xl sm:text-2xl font-light tracking-tight text-foreground/95 font-sans group-hover:text-primary transition-colors leading-snug">
												{post.title}
											</h3>
										</div>

										<div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
											<span className="inline-flex items-center gap-1 text-xs font-mono text-primary/80 group-hover:text-primary transition-colors">
												<span>Read Essay</span>
												<ArrowUpRight className="w-3.5 h-3.5" />
											</span>
										</div>
									</div>

									{/* Excerpt */}
									<div className="py-4">
										<p className="text-sm sm:text-base text-foreground/80 font-normal leading-relaxed line-clamp-3">
											{post.content.replace(/^#+\s+/gm, '').slice(0, 320)}...
										</p>
									</div>

									{/* Tags & Direct Link */}
									<div className="flex flex-wrap items-center justify-between gap-3 pt-2">
										{tags.length > 0 && (
											<div className="flex flex-wrap items-center gap-1.5">
												{tags.map(tag => (
													<span
														key={tag}
														className="px-2.5 py-1 rounded-lg text-xs font-mono bg-foreground/[0.03] text-muted-foreground/80 border border-border/30"
													>
														{tag}
													</span>
												))}
											</div>
										)}

										{post.link && (
											<a
												href={post.link}
												target="_blank"
												rel="noopener noreferrer"
												onClick={e => e.stopPropagation()}
												className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
											>
												<span>Original Source</span>
												<ExternalLink className="w-3 h-3" />
											</a>
										)}
									</div>
								</motion.article>
							);
						})}
					</motion.div>
				)}
			</div>

			{/* Minimal Article Modal */}
			<AnimatePresence>
				{selectedPost && (
					<Portal>
						<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
							<motion.div
								variants={fadeIn}
								initial="hidden"
								animate="visible"
								exit="hidden"
								onClick={() => setSelectedPost(null)}
								className="fixed inset-0 bg-black/60 backdrop-blur-md"
							/>

							<motion.div
								variants={scaleIn}
								initial="hidden"
								animate="visible"
								exit="hidden"
								className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border/60 bg-card/95 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl"
							>
								<div className="flex items-center justify-between pb-4 border-b border-border/30">
									<div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
										<Calendar className="w-3.5 h-3.5" />
										<span>{formatDate(selectedPost.publishedAt ?? selectedPost.createdAt)}</span>
										<span>·</span>
										<span>{readingTime(selectedPost.content)} min read</span>
									</div>
									<button
										onClick={() => setSelectedPost(null)}
										className="p-1.5 rounded-full hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
									>
										<X className="w-5 h-5" />
									</button>
								</div>

								<div className="py-6 space-y-6">
									<h1 className="text-2xl sm:text-3xl font-light tracking-tight text-foreground/95 font-sans leading-tight">
										{selectedPost.title}
									</h1>

									{safeArray(selectedPost.tags).length > 0 && (
										<div className="flex flex-wrap gap-1.5">
											{safeArray(selectedPost.tags).map(tag => (
												<span
													key={tag}
													className="px-2.5 py-1 rounded-lg text-xs font-mono bg-foreground/[0.04] text-primary/90 border border-primary/20"
												>
													{tag}
												</span>
											))}
										</div>
									)}

									<div className="prose prose-invert max-w-none text-foreground/85 text-sm sm:text-base leading-relaxed font-normal whitespace-pre-wrap">
										{selectedPost.content}
									</div>
								</div>

								<div className="pt-6 border-t border-border/30 flex items-center justify-between">
									{selectedPost.link ? (
										<a
											href={selectedPost.link}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:underline"
										>
											<span>Read Original Publication</span>
											<ExternalLink className="w-3.5 h-3.5" />
										</a>
									) : <div />}

									<button
										onClick={() => setSelectedPost(null)}
										className="px-4 py-2 rounded-xl bg-foreground/10 text-xs font-mono hover:bg-foreground/15 text-foreground transition-colors cursor-pointer"
									>
										Close
									</button>
								</div>
							</motion.div>
						</div>
					</Portal>
				)}
			</AnimatePresence>
		</div>
	);
}
