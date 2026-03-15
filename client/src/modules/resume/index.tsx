'use client';

export function ResumeModule() {
	return (
		<div className="h-full w-full flex items-center justify-center p-8">
			<div className="max-w-2xl text-center space-y-6">
				<div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
					<span className="text-3xl">📄</span>
				</div>
				<h1 className="text-3xl font-bold text-foreground">Resume</h1>
				<p className="text-muted-foreground text-lg">
					Professional resume — coming soon.
				</p>
			</div>
		</div>
	);
}
