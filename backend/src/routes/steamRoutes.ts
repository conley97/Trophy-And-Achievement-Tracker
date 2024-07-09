import { Router } from 'express';
import { getUserAchievements } from '../controllers/steamController';

const router = Router();

router.get('/:userId/achievements', getUserAchievements);

export default router;
