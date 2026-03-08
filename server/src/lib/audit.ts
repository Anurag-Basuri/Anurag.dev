import { prisma } from './db';

interface AuditEntry {
	adminId: string;
	action: 'create' | 'update' | 'delete';
	resourceType: string;
	resourceId: string;
	changes: Record<string, unknown>;
}

/**
 * Creates an audit log entry for admin actions.
 * Fire-and-forget — errors are logged but don't break the request.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
	try {
		await prisma.auditLog.create({
			data: {
				adminId: entry.adminId,
				action: entry.action,
				resourceType: entry.resourceType,
				resourceId: entry.resourceId,
				changes: entry.changes,
			},
		});
	} catch (err) {
		console.error('Failed to write audit log:', err);
	}
}
