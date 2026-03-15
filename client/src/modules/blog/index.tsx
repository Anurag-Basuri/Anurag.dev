'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/api/client';
import type { BlogPost } from '@/api/schema';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Calendar, ArrowUpRight, FileText, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/design-system/motion';
import { SectionHeader } from '@/components/layout/SectionHeader';

export function BlogModule() {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		async function fetchPosts() {
			try {
				const data = await apiClient.get<BlogPost[]>('/blog');
				setPosts(data || []);
			} catch (err) {
				console.error('Failed to load blog posts', err);
			} finally {
				setLoading(false);
			}
		}
		fetchPosts();
	}, []);

	const filteredPosts = posts.filter(
		p =>
			p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())),
	);

	if (loading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
			</div>
		);
	}

	return (
		<ScrollArea className="h-full w-full">
			<div className="p-6 md:p-12 max-w-5xl mx-auto pb-32">
				{/* Header */}
				<SectionHeader
					label="Insights"
					icon={BookOpen}
					title="Engineering Log"
					description="Thoughts, tutorials, and retrospective analysis on software engineering and systems design."
					actions={
						<div className="relative group w-full md:w-80 mt-4 md:mt-0">
							<div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
							<input
								type="text"
								placeholder="Search articles & notes..."
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className="relative z-10 w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:bg-black/60 transition-all placeholder:text-muted-foreground/50 backdrop-blur-xl shadow-inner"
							/>
						</div>
					}
				/>

				{filteredPosts.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-32 mt-12 text-muted-foreground border border-dashed border-white/10 rounded-[2.5rem] bg-[#0a0a0a]/50">
						<div className="p-4 rounded-full bg-white/5 mb-6">
							<Search className="w-8 h-8 opacity-50 text-primary" />
						</div>
						<p className="text-lg">
							No articles found matching{' '}
							<span className="text-white">"{searchQuery}"</span>
						</p>
						<button
							onClick={() => setSearchQuery('')}
							className="mt-6 text-sm text-primary hover:text-white transition-colors uppercase tracking-wider font-bold"
						>
							Clear Search
						</button>
					</div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
						className="grid gap-6 mt-12"
					>
						{filteredPosts.map(post => {
							const publishedDate = post.publishedAt
								? new Date(post.publishedAt)
								: new Date();

							return (
								<motion.article
									key={post.id}
									variants={staggerItem}
									className="group relative flex flex-col md:flex-row gap-6 p-6 md:p-8 rounded-[2rem] bg-[#0a0a0a]/80 border border-white/5 backdrop-blur-xl hover:border-primary/40 transition-all duration-500 cursor-pointer overflow-hidden hover:shadow-[0_0_40px_0px_rgba(255,255,255,0.05)] hover:-translate-y-2"
								>
									{/* Hover Ambient Space */}
									<div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

									{/* Date Badge */}
									<div className="flex md:flex-col items-center justify-start md:items-center gap-4 md:gap-2 text-muted-foreground min-w-[120px] md:pt-2 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-8 mb-4 md:mb-0 shrink-0">
										<span className="text-4xl md:text-5xl font-black text-white/90 leading-none tracking-tighter group-hover:text-primary transition-colors drop-shadow-sm">
											{publishedDate.getDate().toString().padStart(2, '0')}
										</span>
										<div className="flex flex-col text-[10px] uppercase tracking-[0.2em] font-bold">
											<span className="text-white/70">
												{publishedDate.toLocaleString('default', {
													month: 'long',
												})}
											</span>
											<span className="text-primary/60 mt-0.5">
												{publishedDate.getFullYear()}
											</span>
										</div>
									</div>

									<div className="flex-1 flex flex-col justify-center space-y-4 z-10 py-2">
										<div className="flex items-start justify-between gap-4">
											<h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-primary transition-colors leading-tight tracking-tight pr-8">
												{post.title}
											</h2>
											<div className="p-3 bg-white/5 rounded-full text-white/50 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-500 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 shrink-0">
												<ArrowUpRight className="w-5 h-5" />
											</div>
										</div>

										<p className="text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-3 text-sm md:text-base pr-4 md:pr-12">
											{post.content}
										</p>

										<div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-white/5">
											<div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-primary/80">
												<Clock className="w-3.5 h-3.5" />
												<span>
													{Math.max(
														1,
														Math.ceil(
															post.content.split(/\s+/).length / 200,
														),
													)}{' '}
													min read
												</span>
											</div>

											{post.tags.length > 0 && (
												<div className="flex flex-wrap gap-2">
													{post.tags.map(tag => (
														<span
															key={tag}
															className="px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider bg-black/50 text-muted-foreground border border-white/5 group-hover:border-primary/20 hover:text-white transition-colors shadow-inner"
														>
															{tag}
														</span>
													))}
												</div>
											)}
										</div>
									</div>
								</motion.article>
							);
						})}
					</motion.div>
				)}
			</div>
		</ScrollArea>
	);
}

