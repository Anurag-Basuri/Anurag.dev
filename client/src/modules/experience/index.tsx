import React from 'react';

export function ExperienceModule() {
	return (
		<div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-8">
			<h1 className="text-4xl font-bold tracking-tight text-foreground">Experience</h1>
			<p className="text-muted-foreground text-lg leading-relaxed">
				This module displays work history, internships, roles, and responsibilities. Data flows from the JourneyEntry (type: work) DB model.
			</p>
			{/* Real implementation will follow */}
		</div>
	);
}
