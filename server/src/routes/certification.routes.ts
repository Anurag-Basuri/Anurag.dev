import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { CertificationCreateSchema, CertificationUpdateSchema } from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import {
	listCertifications,
	createCertification,
	updateCertification,
	deleteCertification,
	uploadCertificationFile,
	deleteCertificationFile,
} from '../controllers/certification.controller';
import { mediaUpload } from '../middleware/multer.middleware';

const router = Router();

router.get('/certifications', asyncHandler(listCertifications));

router.post(
	'/certifications',
	validate(CertificationCreateSchema),
	asyncHandler(createCertification),
);

router.put(
	'/certifications/:id',
	validate(CertificationUpdateSchema),
	asyncHandler(updateCertification),
);

// Upload endpoints (admin-only)
router.post(
	'/certifications/:id/certificate',
	mediaUpload.single('certificate'),
	asyncHandler(uploadCertificationFile),
);
router.delete('/certifications/:id/certificate', asyncHandler(deleteCertificationFile));

router.delete('/certifications/:id', asyncHandler(deleteCertification));

export default router;
