'use client';

import { useEffect, useState } from 'react';
import { api, BlogPost } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Calendar, ArrowUpRight, FileText, BookOpen, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ModuleError } from '@/components/ui/module-error';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { ModuleHeader } from '@/modules/shared/ModuleHeader';

function BlogSkeleton() {
	return (
		<div className="p-8 space-y-8 animate-pulse max-w-5xl mx-auto">
			<div className="flex justify-between items-end border-b border-border/40 pb-6 mb-10">
				<div className="h-10 bg-muted rounded w-48" />
				<div className="h-10 bg-muted rounded-full w-64" />
			</div>
			<div className="space-y-6">
				{[1, 2, 3].map(i => (
					<div key={i} className="h-48 rounded-2xl bg-card/20 border border-border/40" />
				))}
			</div>
		</div>
	);
}

export function BlogModule() {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await api.getBlogPosts();
			setPosts(data);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Failed to load blog posts';
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const filteredPosts = posts.filter(
		p =>
			p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())),
	);

	if (loading) return <BlogSkeleton />;

	if (error) {
		return <ModuleError message={error} onRetry={fetchData} />;
	}

	return (
		<ScrollArea className="h-full">
			<div className="p-6 md:p-12 max-w-6xl mx-auto pb-24">
				{/* Header */}
				<ModuleHeader
					label="Blogs"
					icon={BookOpen}
					title="Engineering Log"
					actions={
						<div className="relative group w-full md:w-72">
							<div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors z-10" />
							<input
								type="text"
								placeholder="Search articles & notes..."
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className="relative z-10 w-full bg-black/20 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all placeholder:text-muted-foreground/50 backdrop-blur-md"
							/>
						</div>
					}
				/>

				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="grid gap-6"
				>
					{filteredPosts.map((post, index) => {
						const publishedDate = post.publishedAt
							? new Date(post.publishedAt)
							: new Date();

						return (
							<motion.article
								key={post.id}
								variants={staggerItem}
								className="group relative flex flex-col md:flex-row gap-6 p-6 md:p-8 rounded-3xl bg-card/30 border border-white/5 backdrop-blur-md hover:bg-card/40 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-2xl hover:-translate-y-1"
							>
								{/* Hover Gradient */}
								<div className="absolute inset-0 bg-linear-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

								{/* Date Badge */}
								<div className="flex md:flex-col items-center md:items-start gap-2 text-muted-foreground min-w-[100px] md:pt-1 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6 mb-4 md:mb-0 shrink-0">
									<span className="text-4xl md:text-5xl font-bold text-foreground/80 leading-none tracking-tighter group-hover:text-emerald-400 transition-colors">
										{publishedDate.getDate()}
									</span>
									<div className="flex flex-col text-xs uppercase tracking-widest font-medium">
										<span className="text-foreground">
											{publishedDate.toLocaleString('default', {
												month: 'short',
											})}
										</span>
										<span className="text-muted-foreground/40">
											{publishedDate.getFullYear()}
										</span>
									</div>
								</div>

								<div className="flex-1 space-y-4 z-10">
									<div className="flex items-start justify-between gap-4">
										<h2 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-emerald-400 transition-colors leading-tight tracking-tight">
											{post.title}
										</h2>
										<div className="p-2 rounded-full bg-white/5 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 shrink-0">
											<ArrowUpRight className="w-5 h-5" />
										</div>
									</div>

									<p className="text-muted-foreground/80 leading-relaxed line-clamp-2 md:line-clamp-3 text-sm md:text-base">
										{post.content}
									</p>

									<div className="flex flex-wrap items-center gap-4 pt-2">
										<div className="flex items-center gap-1.5 text-xs font-mono text-emerald-500/80 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
											<Clock className="w-3.5 h-3.5" />
											<span>{post.readingTime || 5} min read</span>
										</div>

										{post.tags.length > 0 && (
											<div className="flex flex-wrap gap-2">
												{post.tags.map(tag => (
													<span
														key={tag}
														className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-white/5 text-muted-foreground border border-white/5 group-hover:border-white/10 hover:bg-white/10 transition-colors"
													>
														#{tag}
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

				{filteredPosts.length === 0 && (
					<div className="text-center py-20 text-muted-foreground">
						<div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
							<Search className="w-8 h-8 opacity-50" />
						</div>
						<p>No articles found matching &quot;{searchQuery}&quot;</p>
					</div>
				)}
			</div>
		</ScrollArea>
	);
}
