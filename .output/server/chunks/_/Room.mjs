import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  hostId: { type: String, required: true },
  maxPlayers: { type: Number, required: true, min: 2, max: 10 },
  duration: { type: Number, required: true, default: 60 },
  difficulty: { type: Number, required: true, default: 5 },
  musicUrl: { type: String, default: null },
  musicTitle: { type: String, default: null },
  map: { type: mongoose.Schema.Types.Mixed, default: null },
  mapQueue: { type: [mongoose.Schema.Types.Mixed], default: [] },
  players: [{
    userId: { type: String, required: true },
    username: { type: String, required: true },
    isHost: { type: Boolean, default: false },
    isReady: { type: Boolean, default: false },
    progress: { type: Number, default: 0 },
    y: { type: Number, default: 360 },
    clearCount: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now }
  }],
  messages: [{
    userId: { type: String, required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ["waiting", "starting", "playing", "finished"],
    default: "waiting"
  },
  winner: { type: String, default: null },
  startedAt: { type: Date, default: null },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600
    // Auto-delete after 1 hour
  }
});
const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);

export { Room as R };
//# sourceMappingURL=Room.mjs.map
