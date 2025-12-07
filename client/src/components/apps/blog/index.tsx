'use client';

import { useEffect, useState } from 'react';
import { api, BlogPost } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Tag } from 'lucide-react';

export function BlogModule() {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		api.getBlogPosts()
			.then(data => setPosts(data.posts))
			.catch(err => setError(err.message))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<div className="p-6 flex items-center justify-center h-full">
				<div className="text-muted-foreground">Loading blog posts...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 flex items-center justify-center h-full">
				<div className="text-red-500">Error: {error}</div>
			</div>
		);
	}

	return (
		<ScrollArea className="h-full">
			<div className="p-6 space-y-6 font-mono">
				<div>
					<h1 className="text-2xl font-bold text-green-500 mb-2">$ ls blog/</h1>
					<p className="text-muted-foreground">
						{posts.length} post{posts.length !== 1 ? 's' : ''} published
					</p>
				</div>

				<div className="space-y-4">
					{posts.map(post => (
						<div
							key={post.id}
							className="border border-muted rounded-lg p-4 hover:border-green-500/50 transition-colors cursor-pointer"
						>
							<h2 className="text-xl font-bold text-green-400 mb-2">{post.title}</h2>

							{post.publishedAt && (
								<div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
									<Calendar className="w-3 h-3" />
									<span>{new Date(post.publishedAt).toLocaleDateString()}</span>
								</div>
							)}

							<div className="text-sm text-muted-foreground mb-3 line-clamp-3">
								{post.content.substring(0, 200)}...
							</div>

							{post.tags.length > 0 && (
								<div className="flex items-center gap-2 flex-wrap">
									<Tag className="w-3 h-3 text-muted-foreground" />
									{post.tags.map(tag => (
										<span
											key={tag}
											className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400"
										>
											#{tag}
										</span>
									))}
								</div>
							)}
						</div>
					))}
				</div>

				{posts.length === 0 && (
					<div className="text-center py-12 text-muted-foreground">
						<p>No blog posts yet.</p>
						<p className="text-sm mt-2">Check back soon for updates!</p>
					</div>
				)}
			</div>
		</ScrollArea>
	);
}
