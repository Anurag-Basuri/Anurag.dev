export default function PortfolioLoading() {
	return (
		<div className="h-full w-full flex items-center justify-center">
			<div className="flex flex-col items-center gap-3">
				<div
					className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"
					style={{ boxShadow: '0 0 16px rgba(52,211,153,0.3)' }}
				/>
				<div className="text-[10px] text-emerald-500/60 font-mono tracking-wider uppercase animate-pulse">
					Loading module...
				</div>
			</div>
		</div>
	);
}
