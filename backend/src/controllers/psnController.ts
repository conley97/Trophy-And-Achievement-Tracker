import { Request, Response } from 'express';
import { fetchAndProcessPsnTrophies, getPsnTrophiesFromDB, getPsnGameDetailsFromDB } from '../services/psnService';

// Function to update trophies in the database
export const fetchTrophiesAndUpdateDB = async (req: Request, res: Response) => {
  const { username } = req.params;
  try {
    await fetchAndProcessPsnTrophies(username);
    res.status(200).json({ message: 'Trophies processed successfully' });
  } catch (error : any) {
    res.status(500).json({ message: error.message });
  }
};

// Function to get trophies from the database
export const getPsnTrophies = async (req: Request, res: Response) => {
  const { username } = req.params;
  try {
    const trophies = await getPsnTrophiesFromDB(username);
    res.status(200).json(trophies);
  } catch (error : any) {
    res.status(500).json({ message: error.message });
  }
};

// Function to get game details and user trophies for a specific game
export const getPsnGameDetails = async (req: Request, res: Response) => {
  const { username, gameName } = req.params;
  try {
    const gameDetails = await getPsnGameDetailsFromDB(username, gameName);
    res.status(200).json(gameDetails);
  } catch (error : any) {
    res.status(500).json({ message: error.message });
  }
};
