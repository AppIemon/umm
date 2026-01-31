import mongoose from 'mongoose'
import type { Document, Types } from 'mongoose'

export interface IUser extends Document {
  _id: Types.ObjectId
  username: string
  password: string
  displayName: string
  createdAt: Date
  totalScore: number
  mapsCleared: number
  mapsCreated: number
  rating: number
  tier: string
  winStreak: number
  matchHistory: {
    opponent: string
    winner: string
    myScore: number
    opponentScore: number
    date: Date
    ratingChange: number
  }[]
}

const userSchema = new mongoose.Schema<IUser>({
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
    default: 1000
  },
  tier: {
    type: String,
    default: 'Bronze'
  },
  winStreak: {
    type: Number,
    default: 0
  },
  matchHistory: [{
    opponent: String,
    winner: String,
    myScore: Number,
    opponentScore: Number,
    date: { type: Date, default: Date.now },
    ratingChange: Number
  }]
})

// 인덱스
userSchema.index({ totalScore: -1 })
userSchema.index({ mapsCleared: -1 })

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)
