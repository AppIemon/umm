import mongoose from 'mongoose'
import type { Document, Types } from 'mongoose'

export interface IRoom extends Document {
  _id: Types.ObjectId
  title: string
  hostId: string
  maxPlayers: number
  duration: number // Game duration in seconds
  difficulty: number

  map: Types.ObjectId

  players: {
    userId: string
    username: string
    isHost: boolean
    isReady: boolean
    progress: number
    y: number
    lastSeen: Date
  }[]
  messages: {
    userId: string
    username: string
    text: string
    timestamp: Date
  }[]

  status: 'waiting' | 'starting' | 'playing' | 'finished'
  winner: string | null
  createdAt: Date
}

const roomSchema = new mongoose.Schema<IRoom>({
  title: { type: String, required: true },
  hostId: { type: String, required: true },
  maxPlayers: { type: Number, required: true, min: 2, max: 10 },
  duration: { type: Number, required: true, default: 60 },
  difficulty: { type: Number, required: true, default: 5 },

  map: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameMap',
    required: false // May not be assigned initially
  },
  mapQueue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GameMap' }],

  players: [{
    userId: { type: String, required: true },
    username: { type: String, required: true },
    isHost: { type: Boolean, default: false },
    isReady: { type: Boolean, default: false },
    progress: { type: Number, default: 0 },
    y: { type: Number, default: 360 },
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
    enum: ['waiting', 'starting', 'playing', 'finished'],
    default: 'waiting'
  },
  winner: { type: String, default: null },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Auto-delete after 1 hour
  }
})

export const Room = mongoose.models.Room || mongoose.model<IRoom>('Room', roomSchema)
