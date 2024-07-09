import { Router } from 'express';
import { getUserXboxAchievements } from '../controllers/xboxController';

const router = Router();

router.get('/:userId/achievements', getUserXboxAchievements);

export default router;
