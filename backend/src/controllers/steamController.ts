import { Request, Response } from 'express';
import {User} from '../models/users';
import { getSteamAchievements } from '../services/steamService';

export const getUserAchievements = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user || !user.steamId) {
      return res.status(404).send('User or Steam ID not found');
    }
    const achievements = await getSteamAchievements(user.steamId);
    user.steamAchievements = achievements;
    await user.save();
    res.json(achievements);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
};
