import { Router } from 'express';
import { getIgdbGameDetails } from '../controllers/igdbController';

const router = Router();

// Route to get game details from IGDB
router.get('/game/:gameName', getIgdbGameDetails);

export default router;
