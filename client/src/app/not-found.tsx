import React from 'react';
import Link from 'next/link';

export default function NotFound() {
	return (
		<div
			style={{
				padding: 24,
				maxWidth: 720,
				margin: '40px auto',
				fontFamily: 'system-ui, sans-serif',
			}}
		>
			<h1 style={{ fontSize: 24, marginBottom: 8 }}>Page not found</h1>
			<p style={{ opacity: 0.8, marginBottom: 16 }}>
				The page you’re looking for doesn’t exist or was moved.
			</p>
			<Link href="/" passHref legacyBehavior>
				<a
					style={{
						padding: '8px 12px',
						borderRadius: 8,
						border: '1px solid #333',
						background: '#111',
						color: '#fff',
						textDecoration: 'none',
					}}
				>
					Go home
				</a>
			</Link>
		</div>
	);
}
