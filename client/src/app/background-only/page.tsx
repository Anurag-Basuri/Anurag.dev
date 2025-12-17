import { Background3D } from '@/components/os/shell/Background3D';

export default function BackgroundOnlyPage() {
	return (
		<main className="w-screen h-screen overflow-hidden bg-black relative">
			<Background3D />
		</main>
	);
}
