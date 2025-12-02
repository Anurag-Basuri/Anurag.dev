import React from 'react';
import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="max-w-xl mx-auto mt-16 px-6 py-8 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
			<h1 className="text-xl font-semibold mb-2">Page not found</h1>
			<p className="text-muted-foreground mb-6">
				The page you’re looking for doesn’t exist or was moved.
			</p>
			<Link
				href="/"
				className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-muted/40 hover:bg-muted/60 transition-colors"
			>
				Go home
			</Link>
		</div>
	);
}
