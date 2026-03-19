import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import {
	AchievementCreateSchema,
	AchievementUpdateSchema,
	ReorderSchema,
} from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import {
	listAchievements,
	createAchievement,
	updateAchievement,
	reorderAchievements,
	deleteAchievement,
	uploadAchievementProof,
	deleteAchievementProof,
} from '../controllers/achievement.controller';
import { mediaUpload } from '../middleware/multer.middleware';

const router = Router();

router.get('/achievements', asyncHandler(listAchievements));

router.post('/achievements', validate(AchievementCreateSchema), asyncHandler(createAchievement));

router.put('/achievements/:id', validate(AchievementUpdateSchema), asyncHandler(updateAchievement));

router.patch('/achievements/reorder', validate(ReorderSchema), asyncHandler(reorderAchievements));

// Upload endpoints (admin-only)
router.post(
	'/achievements/:id/proof',
	mediaUpload.single('proof'),
	asyncHandler(uploadAchievementProof),
);
router.delete('/achievements/:id/proof', asyncHandler(deleteAchievementProof));

router.delete('/achievements/:id', asyncHandler(deleteAchievement));

export default router;
