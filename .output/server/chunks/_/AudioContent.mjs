import mongoose from 'mongoose';

const audioContentSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  chunks: {
    type: [Buffer],
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const AudioContent = mongoose.models.AudioContent || mongoose.model("AudioContent", audioContentSchema);

export { AudioContent as A };
//# sourceMappingURL=AudioContent.mjs.map
