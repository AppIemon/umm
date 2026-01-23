import mongoose from 'mongoose'
import type { Document, Types } from 'mongoose'

export interface IScore extends Document {
  _id: Types.ObjectId
  map: Types.ObjectId
  mapTitle: string
  player: Types.ObjectId
  playerName: string
  score: number
  progress: number
  isCleared: boolean
  attempts: number
  playedAt: Date
}

const scoreSchema = new mongoose.Schema<IScore>({
  map: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameMap',
    required: true
  },
  mapTitle: {
    type: String,
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
})

// 인덱스
scoreSchema.index({ map: 1, score: -1 })
scoreSchema.index({ player: 1, playedAt: -1 })
scoreSchema.index({ score: -1 })
scoreSchema.index({ isCleared: 1, score: -1 })
scoreSchema.index({ map: 1, player: 1 })

export const Score = mongoose.models.Score || mongoose.model<IScore>('Score', scoreSchema)
