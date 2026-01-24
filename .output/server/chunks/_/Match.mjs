import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  map: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GameMap",
    required: true
  },
  players: [{
    userId: { type: String, ref: "User" },
    username: String,
    progress: { type: Number, default: 0 },
    bestProgress: { type: Number, default: 0 },
    y: { type: Number, default: 360 },
    lastSeen: { type: Date, default: Date.now },
    isReady: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ["waiting", "ready", "playing", "finished"],
    default: "waiting"
  },
  winner: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600
    // Expire matches after 1 hour
  }
});
const Match = mongoose.models.Match || mongoose.model("Match", matchSchema);

export { Match as M };
//# sourceMappingURL=Match.mjs.map
