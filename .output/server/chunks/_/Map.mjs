import mongoose from 'mongoose';

const mapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 120,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  creatorName: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    default: null
  },
  audioData: {
    type: String,
    default: null
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  seed: {
    type: Number,
    required: true
  },
  beatTimes: {
    type: [Number],
    required: true
  },
  sections: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  engineObstacles: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  enginePortals: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  autoplayLog: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  duration: {
    type: Number,
    required: true
  },
  isShared: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  playCount: {
    type: Number,
    default: 0
  },
  clearCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0
  },
  bestPlayer: {
    type: String,
    default: null
  },
  bpm: {
    type: Number,
    default: 120
  },
  measureLength: {
    type: Number,
    default: 2
  },
  ratingSum: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  }
});
mapSchema.index({ creator: 1 });
mapSchema.index({ playCount: -1 });
mapSchema.index({ clearCount: -1 });
mapSchema.index({ likes: -1 });
mapSchema.index({ createdAt: -1 });
mapSchema.index({ difficulty: 1 });
mapSchema.index({ rating: -1 });
const GameMap = mongoose.models.GameMap || mongoose.model("GameMap", mapSchema);

export { GameMap as G };
//# sourceMappingURL=Map.mjs.map
