import { ShieldAlert } from 'lucide-react';
import { publicService } from '@/api/services/public';
import { ReadmeViewer } from '@/readme/ReadmeViewer';

export const dynamic = 'force-dynamic';

export default async function ReadmePage() {
	const { data } = await publicService.getReadme();

	if (!data) {
		return (
			<div className="w-full h-full flex items-center justify-center p-8 pt-16 font-mono">
				<div className="flex flex-col items-center gap-4 text-red-500/80 p-8 border border-red-500/20 bg-red-950/20 rounded-xl">
					<ShieldAlert className="w-12 h-12" />
					<h2 className="text-xl font-bold tracking-widest uppercase">CONNECTION FAILED</h2>
					<p className="text-sm opacity-80 max-w-sm text-center">
						The backend documentation endpoint is offline or the source README.md could
						not be resolved.
					</p>
				</div>
			</div>
		);
	}

	return <ReadmeViewer content={data.content} docMeta={data.metadata} />;
}

