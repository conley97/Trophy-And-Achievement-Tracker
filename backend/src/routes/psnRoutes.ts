import { Router } from 'express';
import { fetchTrophiesAndUpdateDB, getPsnTrophies, getPsnGameDetails } from '../controllers/psnController';

const router = Router();

// Route to update trophies in the database
router.post('/update/:username', fetchTrophiesAndUpdateDB);

// Route to get trophies from the database
router.get('/trophies/:username', getPsnTrophies);

// Route to get game details and user trophies for a specific game
router.get('/game/:username/:gameName', getPsnGameDetails);

export default router;
