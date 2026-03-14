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

router.get('/achievements', asyncHandler(listAchievements));

router.post('/achievements', validate(AchievementCreateSchema), asyncHandler(createAchievement));

router.put('/achievements/:id', validate(AchievementUpdateSchema), asyncHandler(updateAchievement));

router.patch('/achievements/reorder', validate(ReorderSchema), asyncHandler(reorderAchievements));

router.delete('/achievements/:id', asyncHandler(deleteAchievement));

export default router;
