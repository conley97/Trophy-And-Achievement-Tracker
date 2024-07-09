import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  psnId?: string;
  steamId?: string;
  xboxId?: string;
  psnTrophies?: any[];
  steamAchievements?: any[];
  xboxAchievements?: any[];
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  psnId: { type: String },
  steamId: { type: String },
  xboxId: { type: String },
  psnTrophies: { type: Array, default: [] },
  steamAchievements: { type: Array, default: [] },
  xboxAchievements: { type: Array, default: [] },
});

export const User = mongoose.model<IUser>('User', UserSchema);
