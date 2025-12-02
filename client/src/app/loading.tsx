import React from 'react';

export default function Loading() {
	return (
		<div className="grid place-items-center min-h-[50vh]">
			<div
				className="w-7 h-7 rounded-full border-2 border-border border-t-primary animate-spin"
				aria-label="Loading"
			/>
		</div>
	);
}
