import mongoose from 'mongoose'
import type { Document, Types } from 'mongoose'

export interface IMatch extends Document {
  _id: Types.ObjectId
  category: string
  map: Types.ObjectId
  mapQueue: Types.ObjectId[]
  players: {
    userId: string
    username: string
    progress: number
    bestProgress: number
    clearCount: number
    y: number // Real-time Y position
    lastSeen: Date
    isReady: boolean
  }[]
  status: 'waiting' | 'ready' | 'playing' | 'finished'
  winner: string | null
  createdAt: Date
}

const matchSchema = new mongoose.Schema<IMatch>({
  category: {
    type: String,
    required: true
  },
  map: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameMap',
    required: true
  },
  mapQueue: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameMap'
  }],
  players: [{
    userId: { type: String, ref: 'User' },
    username: String,
    progress: { type: Number, default: 0 },
    bestProgress: { type: Number, default: 0 },
    clearCount: { type: Number, default: 0 },
    y: { type: Number, default: 360 },
    lastSeen: { type: Date, default: Date.now },
    isReady: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ['waiting', 'ready', 'playing', 'finished'],
    default: 'waiting'
  },
  winner: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Expire matches after 1 hour
  }
})

export const Match = mongoose.models.Match || mongoose.model<IMatch>('Match', matchSchema)
