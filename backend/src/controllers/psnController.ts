// src/controllers/psnController.ts
import { Request, Response } from 'express';
import { fetchAndProcessPsnTrophies, getPsnTrophiesFromDB } from '../services/psnService';

export const fetchTrophiesAndUpdateDB = async (req: Request, res: Response) => {
  const { username } = req.params;
  try {
    await fetchAndProcessPsnTrophies(username);
    res.status(200).json({ message: 'Trophies updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPsnTrophies = async (req: Request, res: Response) => {
  const { username } = req.params;
  try {
    const trophies = await getPsnTrophiesFromDB(username);
    res.status(200).json(trophies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
