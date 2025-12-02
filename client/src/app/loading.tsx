import React from 'react';

export default function Loading() {
	return (
		<div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}>
			<div
				style={{
					width: 28,
					height: 28,
					border: '3px solid #333',
					borderTopColor: '#999',
					borderRadius: '50%',
					animation: 'spin 1s linear infinite',
				}}
			/>
			<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
		</div>
	);
}
