import React from 'react';

export function SecretModule() {
	return (
		<div className="h-full w-full flex flex-col bg-black">
			<iframe
				width="100%"
				height="100%"
				src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
				title="Secret Video"
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				className="flex-1"
			/>
		</div>
	);
}
