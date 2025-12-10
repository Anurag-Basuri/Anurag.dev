import { useEffect, useState } from 'react';
import { api, BlogPost } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Tag, Search, BookOpen, Clock, ChevronRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function BlogModule() {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		api.getBlogPosts()
			.then(data => setPosts(data.posts))
			.catch(err => setError(err.message))
			.finally(() => setLoading(false));
	}, []);

	const filteredPosts = posts.filter(
		p =>
			p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())),
	);

	if (loading)
		return (
			<div className="p-10 text-center text-muted-foreground animate-pulse">
				Loading library...
			</div>
		);
	if (error) return <div className="p-10 text-center text-red-400">Error: {error}</div>;

	return (
		<ScrollArea className="h-full">
			<div className="p-6 md:p-10 max-w-5xl mx-auto pb-20">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-border/40 pb-6">
					<div>
						<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">
							<BookOpen className="w-4 h-4" />
							<span>Knowledge Base</span>
						</div>
						<h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-foreground to-muted-foreground">
							Engineering Log
						</h1>
					</div>

					<div className="relative group w-full md:w-64">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
						<input
							type="text"
							placeholder="Search articles..."
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className="w-full bg-muted/20 border border-border/50 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-muted/30 transition-all placeholder:text-muted-foreground/50"
						/>
					</div>
				</div>

				<div className="grid gap-6">
					{filteredPosts.map((post, index) => {
						const publishedDate = post.publishedAt
							? new Date(post.publishedAt)
							: new Date(
									posts.length > 0 && posts[0].publishedAt
										? posts[0].publishedAt
										: 0,
							  );

						return (
							<motion.article
								key={post.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: index * 0.05 }}
								className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm hover:bg-card/50 hover:border-emerald-500/30 transition-all cursor-pointer overflow-hidden"
							>
								<div className="absolute inset-0 bg-linear-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

								{/* Simple Date Badge */}
								<div className="flex md:flex-col items-center md:items-start gap-2 text-muted-foreground min-w-[100px] md:pt-1">
									<span className="text-2xl font-bold text-foreground/80 leading-none">
										{publishedDate.getDate()}
									</span>
									<span className="text-xs uppercase tracking-wider font-medium">
										{publishedDate.toLocaleString('default', {
											month: 'short',
											year: 'numeric',
										})}
									</span>
								</div>

								<div className="flex-1 space-y-3 z-10">
									<div className="flex items-start justify-between gap-4">
										<h2 className="text-xl font-bold text-foreground group-hover:text-emerald-400 transition-colors leading-tight">
											{post.title}
										</h2>
										<ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
									</div>

									<p className="text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed">
										{post.content}
									</p>

									<div className="flex items-center gap-4 pt-2">
										<div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
											<Clock className="w-3.5 h-3.5" />
											<span>5 min read</span>
										</div>

										{post.tags.length > 0 && (
											<div className="flex flex-wrap gap-2">
												{post.tags.map(tag => (
													<span
														key={tag}
														className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
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
						<p>No articles found matching your criteria.</p>
					</div>
				)}
			</div>
		</ScrollArea>
	);
}
