// src/models/PsnTrophy.ts
import mongoose from 'mongoose';

const trophySchema = new mongoose.Schema({
  username: String,
  gameName: String,
  platform: String,
  trophies: [{
    trophyId: String,
    trophyName: String,
    trophyType: String,
    trophyRare: String,
    trophyEarnedRate: Number,
    earned: Boolean,
    earnedDateTime: Date
  }]
});

const PsnTrophy = mongoose.model('PsnTrophy', trophySchema);

export default PsnTrophy;
