import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 4
  },
  displayName: {
    type: String,
    required: true,
    maxlength: 20,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  totalScore: {
    type: Number,
    default: 0
  },
  mapsCleared: {
    type: Number,
    default: 0
  },
  mapsCreated: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 1e3
  },
  matchHistory: [{
    opponent: String,
    winner: String,
    myScore: Number,
    opponentScore: Number,
    date: { type: Date, default: Date.now },
    ratingChange: Number
  }]
});
userSchema.index({ totalScore: -1 });
userSchema.index({ mapsCleared: -1 });
const User = mongoose.models.User || mongoose.model("User", userSchema);

export { User as U };
//# sourceMappingURL=User.mjs.map
