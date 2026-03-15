import React from 'react';

export function ProfileModule() {
	return (
		<div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-8">
			<h1 className="text-4xl font-bold tracking-tight text-foreground">Profile</h1>
			<p className="text-muted-foreground text-lg leading-relaxed">
				This module displays the name, bio, location, open-to-work status, and skills. Data is mapped from the Profile database model.
			</p>
			{/* Real implementation will follow */}
		</div>
	);
}
