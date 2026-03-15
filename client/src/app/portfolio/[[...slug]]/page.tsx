'use client';

import { useParams } from 'next/navigation';
import { PortfolioContent } from '../PortfolioContent';

export default function PortfolioPage() {
	const params = useParams();
	const slug = params.slug as string[] | undefined;
	return <PortfolioContent initialSection={slug?.[0]} />;
}
