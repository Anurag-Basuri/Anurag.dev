import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { listMessages, getMessage, deleteMessage } from '../controllers/messages.controller';

const router = Router();

router.get('/messages', asyncHandler(listMessages));

router.get('/messages/:id', asyncHandler(getMessage));

router.delete('/messages/:id', asyncHandler(deleteMessage));

export default router;
