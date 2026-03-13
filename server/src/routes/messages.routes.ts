import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { listMessages, getMessage, deleteMessage } from '../controllers/messages.controller';

const router = Router();

router.get('/admin/messages', asyncHandler(listMessages));

router.get('/admin/messages/:id', asyncHandler(getMessage));

router.delete('/admin/messages/:id', asyncHandler(deleteMessage));

export default router;
