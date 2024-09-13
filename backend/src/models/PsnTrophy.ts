import mongoose from 'mongoose';

const TrophySchema = new mongoose.Schema({
  username: { type: String, required: true },
  gameName: { type: String, required: true },
  platform: { type: String, required: true },
  trophies: [
    {
      trophyId: { type: Number, required: true },
      trophyName: { type: String, required: true },
      trophyType: { type: String, required: true },
      trophyRare: { type: String, required: true },
      trophyEarnedRate: { type: Number, required: true },
      earned: { type: Boolean, required: true },
      earnedDateTime: { type: Date },
      trophyIconUrl: { type: String, required: false }
    }
  ],
  backgroundUrl: { type: String, required: true },
  imageUrl: { type: String, required: true },
  coverUrl: { type: String, required: true },
  completion: { type: Number, required: true }  // Completion percentage
});

const TrophyModel = mongoose.model('PsnTrophy', TrophySchema);

export default TrophyModel;
