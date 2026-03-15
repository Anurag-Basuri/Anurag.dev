import { redirect } from 'next/navigation';

// Force dynamic — server redirect can't be statically prerendered
export const dynamic = 'force-dynamic';

export default function HomePage() {
	redirect('/portfolio');
}
