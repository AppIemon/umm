import mongoose from 'mongoose'
import type { Document } from 'mongoose'

export interface IAudioContent extends Document {
  hash: string;      // SHA-256 or similar hash of the audio data
  chunks: Buffer[];  // Binary chunks
  size: number;
  createdAt: Date;
}

const audioContentSchema = new mongoose.Schema<IAudioContent>({
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
})

export const AudioContent = mongoose.models.AudioContent || mongoose.model<IAudioContent>('AudioContent', audioContentSchema)
