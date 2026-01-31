import mongoose from 'mongoose'
import type { Document } from 'mongoose'

export interface IMusicRequest extends Document {
  hash: string;          // SHA-256 hash of the audio file
  filename: string;      // Filename (e.g., hash + extension)
  title?: string;        // Original track title
  requestedBy: mongoose.Types.ObjectId;  // User who requested
  requestedByName: string;  // Username for display
  status: 'pending' | 'approved' | 'rejected';
  bpm?: number;
  measureLength?: number;
  createdAt: Date;
  processedAt?: Date;    // When it was approved/rejected
  processedBy?: mongoose.Types.ObjectId;  // Admin who processed
}

const musicRequestSchema = new mongoose.Schema<IMusicRequest>({
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: null
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedByName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  bpm: {
    type: Number,
    default: 120
  },
  measureLength: {
    type: Number,
    default: 2.0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  processedAt: {
    type: Date,
    default: null
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
})

export const MusicRequest = mongoose.models.MusicRequest || mongoose.model<IMusicRequest>('MusicRequest', musicRequestSchema)
