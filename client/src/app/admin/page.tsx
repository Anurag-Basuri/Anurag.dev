'use client';

import { useCallback, useState } from 'react';
import { useAuth, useApi } from '@/api';
import { adminService } from '@/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DashboardCounts {
	projects: number;
	journey: number;
	achievements: number;
	certifications: number;
	blog: number;
	messages: number;
}

export default function AdminDashboardPage() {
	const router = useRouter();
	const { logout } = useAuth();
	const [loggingOut, setLoggingOut] = useState(false);

	const fetcher = useCallback(async (): Promise<DashboardCounts> => {
		const [projects, journey, achievements, certifications, blog, messages] = await Promise.all([
			adminService.getProjects().catch(() => []),
			adminService.getJourney().catch(() => []),
			adminService.getAchievements().catch(() => []),
			adminService.getCertifications().catch(() => []),
			adminService.getBlogPosts().catch(() => []),
			adminService.getMessages().catch(() => []),
		]);
		return {
			projects: projects.length,
			journey: journey.length,
			achievements: achievements.length,
			certifications: certifications.length,
			blog: blog.length,
			messages: messages.length,
		};
	}, []);

	const { data: counts, loading } = useApi<DashboardCounts>(fetcher);

	async function handleLogout() {
		setLoggingOut(true);
		await logout();
		router.push('/admin/login');
	}

	const cards = [
		{ label: 'Projects', count: counts?.projects, href: '/admin/projects' },
		{ label: 'Journey', count: counts?.journey, href: '/admin/journey' },
		{ label: 'Achievements', count: counts?.achievements, href: '/admin/achievements' },
		{ label: 'Certifications', count: counts?.certifications, href: '/admin/certifications' },
		{ label: 'Blog Posts', count: counts?.blog, href: '/admin/blog' },
		{ label: 'Messages', count: counts?.messages, href: '/admin/messages' },
	];

	return (
		<div className="max-w-5xl">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold">Dashboard</h1>
					<p className="text-zinc-500 text-sm mt-1">Manage your portfolio content</p>
				</div>
				<button
					onClick={handleLogout}
					disabled={loggingOut}
					className="px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors disabled:opacity-50"
				>
					{loggingOut ? 'Signing out...' : 'Sign Out'}
				</button>
			</div>

			{/* Cards Grid */}
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{cards.map((card) => (
					<Link
						key={card.label}
						href={card.href}
						className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-colors group"
					>
						<p className="text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">
							{card.label}
						</p>
						<p className="text-3xl font-bold mt-2">
							{loading ? (
								<span className="inline-block w-8 h-8 bg-zinc-800 rounded animate-pulse" />
							) : (
								card.count ?? '—'
							)}
						</p>
					</Link>
				))}
			</div>
		</div>
	);
}
