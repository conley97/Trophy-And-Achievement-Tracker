import { Request, Response } from 'express';
import fetchGameDetails from '../services/igdbService';

export const getIgdbGameDetails = async (req: Request, res: Response) => {
  try {
    const { gameName } = req.params;
    const gameDetails = await fetchGameDetails(gameName);
    res.json(gameDetails);
  } catch (error: any) {
    console.error('Error fetching IGDB game details:', error.message);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
};
