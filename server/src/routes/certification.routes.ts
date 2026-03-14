import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import {
	CertificationCreateSchema,
	CertificationUpdateSchema,
} from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import {
	listCertifications,
	createCertification,
	updateCertification,
	deleteCertification,
} from '../controllers/certification.controller';

const router = Router();

router.get('/admin/certifications', asyncHandler(listCertifications));

router.post(
	'/admin/certifications',
	validate(CertificationCreateSchema),
	asyncHandler(createCertification),
);

router.put(
	'/admin/certifications/:id',
	validate(CertificationUpdateSchema),
	asyncHandler(updateCertification),
);

router.delete('/admin/certifications/:id', asyncHandler(deleteCertification));

export default router;
