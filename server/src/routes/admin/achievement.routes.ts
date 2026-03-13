import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.middleware';
import { AchievementSchema } from '../../schemas/zod-schemas';
import { asyncHandler } from '../../utils/asyncHandler';
import {
	listAchievements,
	createAchievement,
	updateAchievement,
	reorderAchievements,
	deleteAchievement,
} from '../../controllers/achievement.controller';

const AchievementUpdateSchema = AchievementSchema.partial().omit({ id: true });

const ReorderSchema = z.object({
	items: z.array(z.object({ id: z.string(), order: z.number().int().min(0) })),
});

const router = Router();

router.get('/api/admin/achievements', asyncHandler(listAchievements));

router.post(
	'/api/admin/achievements',
	validate(AchievementSchema.omit({ id: true })),
	asyncHandler(createAchievement),
);

router.put(
	'/api/admin/achievements/:id',
	validate(AchievementUpdateSchema),
	asyncHandler(updateAchievement),
);

router.patch(
	'/api/admin/achievements/reorder',
	validate(ReorderSchema),
	asyncHandler(reorderAchievements),
);

router.delete('/api/admin/achievements/:id', asyncHandler(deleteAchievement));

export default router;
