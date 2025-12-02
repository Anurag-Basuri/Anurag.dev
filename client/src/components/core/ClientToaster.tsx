'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function ClientToaster() {
	return (
		<Toaster
			position="bottom-center"
			toastOptions={{
				style: {
					background: 'var(--popover)',
					color: 'var(--popover-foreground)',
					border: '1px solid var(--border)',
					boxShadow: '0 8px 32px -8px rgba(0,0,0,0.35)',
					backdropFilter: 'blur(10px)',
				},
				success: { iconTheme: { primary: '#10b981', secondary: 'var(--popover)' } },
				error: { iconTheme: { primary: '#f59e0b', secondary: 'var(--popover)' } },
			}}
		/>
	);
}
