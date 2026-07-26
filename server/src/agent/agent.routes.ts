import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as AgentController from './agent.controller';

const router = Router();

// Rate limiter for chat endpoint
const chatLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 15,
	message: 'Too many messages sent. Please wait a minute.',
});

router.post('/', chatLimiter, AgentController.sendMessage);
// Clear session memory
router.post('/reset', AgentController.resetSession);

export default router;
