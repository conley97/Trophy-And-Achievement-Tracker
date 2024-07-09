import { Router } from 'express';
import { fetchTrophiesAndUpdateDB, getPsnTrophies } from '../controllers/psnController';

const router = Router();

// Route to update trophies in the database
router.post('/update/:username', fetchTrophiesAndUpdateDB);

// Route to get trophies from the database
router.get('/trophies/:username', getPsnTrophies);

export default router;
