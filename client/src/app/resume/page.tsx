import { ShieldAlert } from 'lucide-react';
import { publicService } from '@/api/services/public';
import { ResumeViewer } from '@/resume/ResumeViewer';

export const dynamic = 'force-dynamic';

export default async function ResumePage() {
	const { data: profile } = await publicService.getProfile();

	if (!profile || !profile.resumeUrl) {
		return (
			<div className="w-full h-full flex items-center justify-center p-8 pt-16 font-mono">
				<div className="flex flex-col items-center gap-4 text-emerald-500/80 p-8 border border-emerald-500/20 bg-emerald-950/20 rounded-xl max-w-md text-center">
					<ShieldAlert className="w-12 h-12" />
					<h2 className="text-xl font-bold tracking-widest uppercase">FILE NOT FOUND</h2>
					<p className="text-sm opacity-80">
						Resume document has not been uploaded to the system.
					</p>
				</div>
			</div>
		);
	}

	return <ResumeViewer resumeUrl={profile.resumeUrl} profileName={profile.name} />;
}
