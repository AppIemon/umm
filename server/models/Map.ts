import mongoose from 'mongoose'
import type { Document, Types } from 'mongoose'

export interface IMap extends Document {
  _id: Types.ObjectId
  title: string
  creator: Types.ObjectId
  creatorName: string
  difficulty: number // 1 ~ 100
  seed: number
  beatTimes: number[]
  sections: any[]
  engineObstacles: any[] // GameEngine's generated obstacles
  enginePortals: any[]   // GameEngine's generated portals
  autoplayLog: any[]     // Validated route
  duration: number
  isShared: boolean      // 공유 여부
  createdAt: Date
  playCount: number
  clearCount: number
  likes: number
  bestScore: number
  bestPlayer: string | null
}

const mapSchema = new mongoose.Schema<IMap>({
  title: {
    type: String,
    required: true,
    maxlength: 120,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorName: {
    type: String,
    required: true
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
  }
})

// 인덱스
mapSchema.index({ creator: 1 })
mapSchema.index({ playCount: -1 })
mapSchema.index({ clearCount: -1 })
mapSchema.index({ likes: -1 })
mapSchema.index({ createdAt: -1 })
mapSchema.index({ difficulty: 1 })

export const GameMap = mongoose.models.GameMap || mongoose.model<IMap>('GameMap', mapSchema)
