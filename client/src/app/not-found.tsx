import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center p-6">
			<div className="max-w-md w-full text-center">
				{/* Icon */}
				<div className="relative inline-block mb-6">
					<div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
					<div className="relative bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
						<FileQuestion className="w-12 h-12 text-blue-400" />
					</div>
				</div>

				{/* Content */}
				<h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
				<p className="text-white/60 mb-8">
					The page you're looking for doesn't exist or has been moved.
				</p>

				{/* Actions */}
				<div className="flex items-center justify-center gap-3">
					<Link
						href="/portfolio"
						className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30 font-medium"
					>
						<Home className="w-4 h-4" />
						Go Home
					</Link>
				</div>
			</div>
		</div>
	);
}
