'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
	{ href: '/admin', label: 'Dashboard', icon: '⌘' },
	{ href: '/admin/profile', label: 'Profile', icon: '👤' },
	{ href: '/admin/projects', label: 'Projects', icon: '📁' },
	{ href: '/admin/journey', label: 'Journey', icon: '🛤️' },
	{ href: '/admin/achievements', label: 'Achievements', icon: '🏆' },
	{ href: '/admin/certifications', label: 'Certifications', icon: '📜' },
	{ href: '/admin/blog', label: 'Blog', icon: '✍️' },
	{ href: '/admin/messages', label: 'Messages', icon: '💬' },
];

export function AdminNav() {
	const pathname = usePathname();

	return (
		<nav className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-1">
			<h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-3">
				Admin Panel
			</h2>
			{NAV_ITEMS.map((item) => {
				const isActive = pathname === item.href;
				return (
					<Link
						key={item.href}
						href={item.href}
						className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
							isActive
								? 'bg-blue-600/15 text-blue-400 font-medium'
								: 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
						}`}
					>
						<span className="text-base">{item.icon}</span>
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}
