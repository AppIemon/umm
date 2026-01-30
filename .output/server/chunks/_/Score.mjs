import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  map: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GameMap",
    required: true
  },
  mapTitle: {
    type: String,
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  playerName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  progress: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  isCleared: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 1
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
});
scoreSchema.index({ map: 1, score: -1 });
scoreSchema.index({ player: 1, playedAt: -1 });
scoreSchema.index({ score: -1 });
scoreSchema.index({ isCleared: 1, score: -1 });
scoreSchema.index({ map: 1, player: 1 });
const Score = mongoose.models.Score || mongoose.model("Score", scoreSchema);

export { Score as S };
//# sourceMappingURL=Score.mjs.map
