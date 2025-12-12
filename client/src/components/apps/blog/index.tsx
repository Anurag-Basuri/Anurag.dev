'use client';

import { useEffect, useState } from 'react';
import { api, BlogPost } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Tag, Search, BookOpen, Clock, ChevronRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ModuleError } from '@/components/ui/module-error';

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
		} catch (err: any) {
			setError(err.message);
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
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border/40 pb-6">
					<div>
						<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">
							<BookOpen className="w-4 h-4" />
							<span>Knowledge Base</span>
						</div>
						<h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-foreground to-muted-foreground">
							Engineering Log
						</h1>
					</div>

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
				</div>

				<div className="grid gap-6">
					{filteredPosts.map((post, index) => {
						const publishedDate = post.publishedAt
							? new Date(post.publishedAt)
							: new Date();

						return (
							<motion.article
								key={post.id}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
								className="group relative flex flex-col md:flex-row gap-6 p-6 md:p-8 rounded-3xl bg-card/20 border border-border/40 backdrop-blur-md hover:bg-card/40 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-2xl hover:-translate-y-1"
							>
								{/* Hover Gradient */}
								<div className="absolute inset-0 bg-linear-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

								{/* Date Badge */}
								<div className="flex md:flex-col items-center md:items-start gap-2 text-muted-foreground min-w-[100px] md:pt-1 border-b md:border-b-0 md:border-r border-border/40 pb-4 md:pb-0 md:pr-6 mb-4 md:mb-0">
									<span className="text-4xl md:text-5xl font-bold text-foreground/80 leading-none tracking-tighter group-hover:text-emerald-400 transition-colors">
										{publishedDate.getDate()}
									</span>
									<div className="flex flex-col text-xs uppercase tracking-widest font-medium">
										<span>
											{publishedDate.toLocaleString('default', {
												month: 'short',
											})}
										</span>
										<span className="text-muted-foreground/50">
											{publishedDate.getFullYear()}
										</span>
									</div>
								</div>

								<div className="flex-1 space-y-4 z-10">
									<div className="flex items-start justify-between gap-4">
										<h2 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-emerald-400 transition-colors leading-tight">
											{post.title}
										</h2>
										<div className="p-2 rounded-full bg-white/5 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0">
											<ArrowUpRight className="w-5 h-5" />
										</div>
									</div>

									<p className="text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-3">
										{post.content}
									</p>

									<div className="flex flex-wrap items-center gap-4 pt-2">
										<div className="flex items-center gap-1.5 text-xs font-mono text-emerald-500/80 bg-emerald-500/10 px-2 py-1 rounded">
											<Clock className="w-3.5 h-3.5" />
											<span>{post.readingTime || 5} min read</span>
										</div>

										{post.tags.length > 0 && (
											<div className="flex flex-wrap gap-2">
												{post.tags.map(tag => (
													<span
														key={tag}
														className="px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-white/5 text-muted-foreground border border-white/5 group-hover:border-white/10 transition-colors"
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
				</div>

				{filteredPosts.length === 0 && (
					<div className="text-center py-20 text-muted-foreground">
						<div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
							<Search className="w-8 h-8 opacity-50" />
						</div>
						<p>No articles found matching "{searchQuery}"</p>
					</div>
				)}
			</div>
		</ScrollArea>
	);
}
