import { Router } from 'express';
import { sendMessage, resetSession } from '../controllers/chat.controller';
import { rateLimit } from '../middleware/rate-limit.middleware';

const router = Router();

const chatLimiter = rateLimit({ max: 20, windowSeconds: 60, prefix: 'rl:chat' });

// Chat endpoints (rate limited to prevent abuse of the AI API)
router.post('/chat', chatLimiter, sendMessage);
router.post('/chat/reset', chatLimiter, resetSession);

export default router;
