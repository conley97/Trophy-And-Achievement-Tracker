import { Request, Response } from 'express';
import {User} from '../models/users';
import { getXboxAchievements } from '../services/xboxService';

export const getUserXboxAchievements = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user || !user.xboxId) {
      return res.status(404).send('User or Xbox ID not found');
    }
    const achievements = await getXboxAchievements(user.xboxId);
    user.xboxAchievements = achievements;
    await user.save();
    res.json(achievements);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
};
