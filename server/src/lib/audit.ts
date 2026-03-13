interface AuditEntry {
	adminId: string;
	action: string;
	resourceType: string;
	resourceId: string;
	changes?: unknown;
}

// In a real implementation, this would likely write to a database or external logging service
export async function logAudit(entry: AuditEntry): Promise<void> {
	console.log(
		JSON.stringify({
			level: 'audit',
			timestamp: new Date().toISOString(),
			...entry,
		}),
	);
}
