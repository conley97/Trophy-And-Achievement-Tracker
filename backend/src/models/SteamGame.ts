import mongoose, { Document, Schema } from 'mongoose';

export interface ISteamGame extends Document {
  steamId: string;
  appId: number;
  gameName: string;
  achievements: any[];
  imageUrl: string;
  completion: number;
}

const SteamGameSchema: Schema = new Schema({
  steamId: { type: String, required: true },
  appId: { type: Number, required: true },
  gameName: { type: String, required: true },
  achievements: { type: Array, default: [] },
  imageUrl: { type: String, required: false },
  completion: { type: Number, required: true },
  backgroundUrl: {type: String, required: true},
  coverUrl: { type: String, required: true },
});

// Create an index to ensure uniqueness of steamId and appId combination
SteamGameSchema.index({ steamId: 1, appId: 1 }, { unique: true });

export const SteamGame = mongoose.model<ISteamGame>('SteamGame', SteamGameSchema);
export default SteamGame;
