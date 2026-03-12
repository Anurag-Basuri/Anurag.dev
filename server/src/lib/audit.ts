interface AuditEntry {
	adminId: string;
	action: string;
	resourceType: string;
	resourceId: string;
	changes?: unknown;
}

/**
 * Log an admin action for audit purposes.
 * Currently writes to stdout in structured JSON.
 * Replace with a database insert when an AuditLog model is added.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
	console.log(
		JSON.stringify({
			level: 'audit',
			timestamp: new Date().toISOString(),
			...entry,
		}),
	);
}
