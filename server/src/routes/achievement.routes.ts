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
} from '../controllers/achievement.controller';

const router = Router();

router.get('/admin/achievements', asyncHandler(listAchievements));

router.post(
	'/admin/achievements',
	validate(AchievementCreateSchema),
	asyncHandler(createAchievement),
);

router.put(
	'/admin/achievements/:id',
	validate(AchievementUpdateSchema),
	asyncHandler(updateAchievement),
);

router.patch(
	'/admin/achievements/reorder',
	validate(ReorderSchema),
	asyncHandler(reorderAchievements),
);

router.delete('/admin/achievements/:id', asyncHandler(deleteAchievement));

export default router;
