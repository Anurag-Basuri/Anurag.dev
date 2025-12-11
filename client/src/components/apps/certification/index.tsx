import { useEffect } from 'react';

export function CertificationModule() {
	useEffect(() => {
		console.log('CertificationModule mounted');
	}, []);
	return <div>certification</div>;
};