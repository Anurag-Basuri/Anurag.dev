'use client';

import { useEffect, useState } from 'react';

export function ReadmeModule() {
	const [content, setContent] = useState<string | null>(null);

	useEffect(() => {
		// Fetch the actual README.md from public folder
		fetch('/README.md')
			.then(res => (res.ok ? res.text() : null))
			.catch(() => null)
			.then(text => setContent(text));
	}, []);

	return (
		<div className="h-full w-full overflow-auto p-6 md:p-10">
			<div className="max-w-3xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl">
						📖
					</div>
					<div>
						<h1 className="text-2xl font-bold text-foreground">README.md</h1>
						<p className="text-sm text-muted-foreground">About this portfolio</p>
					</div>
				</div>

				{/* Content */}
				<div className="rounded-xl border border-border/30 bg-muted/20 backdrop-blur-sm p-6 md:p-8">
					{content ? (
						<pre className="whitespace-pre-wrap text-sm text-foreground/80 font-mono leading-relaxed">
							{content}
						</pre>
					) : (
						<div className="space-y-6 text-foreground/80">
							<div className="space-y-2">
								<h2 className="text-xl font-bold text-foreground">👋 Welcome to Anurag&apos;s Portfolio</h2>
								<p className="text-muted-foreground leading-relaxed">
									An interactive, OS-themed portfolio built with Next.js, TypeScript, and Framer Motion.
									Navigate using the sidebar file tree or the terminal below.
								</p>
							</div>

							<div className="space-y-2">
								<h3 className="text-lg font-semibold text-foreground">🗂️ File Structure</h3>
								<div className="font-mono text-sm space-y-1 text-muted-foreground">
									<p>📁 profile/ — About me &amp; resume</p>
									<p>📁 career/ — Work experience &amp; education</p>
									<p>📁 projects/ — Showcase &amp; coding stats</p>
									<p>📁 shelf/ — Achievements, certifications &amp; blog</p>
									<p>🤖 ask-anurag.ai — AI assistant</p>
									<p>📧 contact.sh — Get in touch</p>
								</div>
							</div>

							<div className="space-y-2">
								<h3 className="text-lg font-semibold text-foreground">⌨️ Terminal Commands</h3>
								<div className="font-mono text-sm space-y-1 text-muted-foreground">
									<p><code className="px-1.5 py-0.5 bg-muted rounded text-xs">help</code> — Show all commands</p>
									<p><code className="px-1.5 py-0.5 bg-muted rounded text-xs">ls</code> — List files</p>
									<p><code className="px-1.5 py-0.5 bg-muted rounded text-xs">open about</code> — Open a module</p>
									<p><code className="px-1.5 py-0.5 bg-muted rounded text-xs">theme toggle</code> — Switch theme</p>
								</div>
							</div>

							<div className="space-y-2">
								<h3 className="text-lg font-semibold text-foreground">🛠️ Tech Stack</h3>
								<div className="flex flex-wrap gap-2">
									{['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Jotai', 'Prisma', 'Fastify'].map(tech => (
										<span key={tech} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
											{tech}
										</span>
									))}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
