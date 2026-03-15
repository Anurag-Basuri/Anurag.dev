// Minimal loading state that matches boot sequence aesthetic
export default function Loading() {
	return (
		<div className="fixed inset-0 bg-[#020202] flex items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				{/* Pulsing dot */}
				<div className="relative">
					<div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
					<div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
				</div>
				{/* Loading text */}
				<p className="text-emerald-500/40 text-xs font-mono tracking-widest uppercase">
					Loading...
				</p>
			</div>
		</div>
	);
}

