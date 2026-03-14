'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const { isAuthenticated } = useAuth();
	const [checked, setChecked] = useState(false);

	const isLoginPage = pathname === '/admin/login';

	useEffect(() => {
		// Allow login page without auth
		if (isLoginPage) {
			setChecked(true);
			return;
		}

		// Redirect to login if not authenticated
		if (!isAuthenticated) {
			router.replace('/admin/login');
			return;
		}

		setChecked(true);
	}, [isAuthenticated, isLoginPage, router]);

	// Show nothing until auth check completes (prevents flash)
	if (!checked) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#020202]">
				<div className="w-6 h-6 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
			</div>
		);
	}

	return <>{children}</>;
}
