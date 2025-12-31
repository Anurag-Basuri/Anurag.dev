import { redirect } from 'next/navigation';

// Server-side redirect - more efficient than client-side
export default function HomePage() {
	redirect('/portfolio');
}
