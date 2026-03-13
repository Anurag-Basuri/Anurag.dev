import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import {
	listMessages,
	getMessage,
	deleteMessage,
} from '../../controllers/messages.controller';

const router = Router();

router.get('/api/admin/messages', asyncHandler(listMessages));
router.get('/api/admin/messages/:id', asyncHandler(getMessage));
router.delete('/api/admin/messages/:id', asyncHandler(deleteMessage));

export default router;
