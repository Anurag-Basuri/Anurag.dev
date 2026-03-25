import { Router } from 'express';
import { getAgentSessions, deleteAgentSession } from './agent.admin.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/agent-sessions', asyncHandler(getAgentSessions));
router.delete('/agent-sessions/:id', asyncHandler(deleteAgentSession));

export default router;
