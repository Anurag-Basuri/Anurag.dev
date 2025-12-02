'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function ClientToaster() {
	return (
		<Toaster
			position="bottom-center"
			toastOptions={{
				style: {
					background: '#0b0b0b',
					color: '#eaeaea',
					border: '1px solid rgba(255,255,255,0.08)',
				},
				success: { iconTheme: { primary: '#10b981', secondary: '#0b0b0b' } },
				error: { iconTheme: { primary: '#f59e0b', secondary: '#0b0b0b' } },
			}}
		/>
	);
}
