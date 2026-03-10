interface AuditEntry {
	adminId: string;
	action: 'create' | 'update' | 'delete';
	resourceType: string;
	resourceId: string;
	changes: unknown;
}

/**
 * Logs admin actions to the console.
 * TODO: Persist to database once admin auth is implemented.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
	console.log(
		`[AUDIT] ${entry.action.toUpperCase()} ${entry.resourceType}#${entry.resourceId} by ${entry.adminId}`,
	);
}
