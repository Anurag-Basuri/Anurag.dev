'use client';

import React from 'react';
import Link from 'next/link';

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="min-h-[60vh] max-w-3xl mx-auto px-6 py-12 font-sans">
			<h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
			<p className="text-white/70 mb-6">
				The page failed to load. You can retry or return to the home screen.
			</p>

			{process.env.NODE_ENV !== 'production' ? (
				<pre className="text-sm bg-black/50 border border-white/10 rounded p-4 overflow-auto">
					{error?.stack || error?.message}
				</pre>
			) : null}

			<div className="flex gap-3 mt-6">
				<button
					onClick={() => reset()}
					className="px-3 py-2 rounded border border-white/10 bg-white/5 hover:bg-white/10"
				>
					Try again
					<Link
						href="/"
						className="px-3 py-2 rounded border border-white/10 bg-white/5 hover:bg-white/10"
					>
						Go home
					</Link>
				</button>
			</div>
		</div>
	);
}
