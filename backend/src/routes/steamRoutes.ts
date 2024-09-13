import { Router } from 'express';
import { updateSteamGames, getSteamGames, getSteamGameDetails } from '../controllers/steamController';

const router = Router();

// Route to update Steam games in the database
router.post('/update/:steamId', updateSteamGames);

// Route to get all Steam games from the database
router.get('/games/:steamId', getSteamGames);

// Route to get game details and user achievements for a specific game
router.get('/game/:steamId/:gameName', getSteamGameDetails);

export default router;
