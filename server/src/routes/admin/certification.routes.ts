import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { CertificationSchema } from '../../schemas/zod-schemas';
import { asyncHandler } from '../../utils/asyncHandler';
import {
	listCertifications,
	createCertification,
	updateCertification,
	deleteCertification,
} from '../../controllers/certification.controller';

const CertificationUpdateSchema = CertificationSchema.partial().omit({ id: true });

const router = Router();

router.get('/api/admin/certifications', asyncHandler(listCertifications));

router.post(
	'/api/admin/certifications',
	validate(CertificationSchema.omit({ id: true })),
	asyncHandler(createCertification),
);

router.put(
	'/api/admin/certifications/:id',
	validate(CertificationUpdateSchema),
	asyncHandler(updateCertification),
);

router.delete('/api/admin/certifications/:id', asyncHandler(deleteCertification));

export default router;
