import { Request, Response } from 'express';
import { fetchAndProcessSteamGames, getSteamGamesFromDB, getSteamGameDetailsFromDB } from '../services/steamService';

export const updateSteamGames = async (req: Request, res: Response) => {
  try {
    const { steamId } = req.params;
    await fetchAndProcessSteamGames(steamId);
    res.status(200).json({ message: 'Steam games updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSteamGames = async (req: Request, res: Response) => {
  try {
    const { steamId } = req.params;
    const games = await getSteamGamesFromDB(steamId);
    res.status(200).json(games);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSteamGameDetails = async (req: Request, res: Response) => {
  try {
    const { steamId, gameName } = req.params;
    console.log(steamId, gameName)
    const gameDetails = await getSteamGameDetailsFromDB(steamId, gameName);
    res.status(200).json(gameDetails);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
