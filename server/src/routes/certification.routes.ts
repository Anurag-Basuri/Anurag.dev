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

router.get('/certifications', asyncHandler(listCertifications));

router.post('/certifications', validate(CertificationCreateSchema), asyncHandler(createCertification));

router.put('/certifications/:id', validate(CertificationUpdateSchema), asyncHandler(updateCertification));

router.delete('/certifications/:id', asyncHandler(deleteCertification));

export default router;
