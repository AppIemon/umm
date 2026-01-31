import { Room } from '~/server/models/Room'
import { User } from '~/server/models/User'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, maxPlayers, duration, userId, username: passedUsername, difficulty, musicUrl, musicTitle, musicBpm, musicMeasureLength } = body

  if (!userId || !title) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  // Get user info
  const isValidId = mongoose.Types.ObjectId.isValid(userId)
  const user = isValidId ? await User.findById(userId) : null
  const username = passedUsername || user?.displayName || user?.username || `Guest_${Math.floor(Math.random() * 1000)}`

  // Create room
  const newRoom = await Room.create({
    title,
    hostId: userId,
    maxPlayers: maxPlayers || 4,
    duration: duration || 60,
    difficulty: difficulty || 5,
    musicUrl: musicUrl || null,
    musicTitle: musicTitle || null,
    musicBpm: musicBpm || 120,
    musicMeasureLength: musicMeasureLength || 2.0,
    players: [{
      userId,
      username,
      isHost: true,
      isReady: true, // Host is always ready? Or explicit?
      progress: 0,
      y: 360,
      lastSeen: new Date()
    }],
    status: 'waiting'
  })

  return { success: true, roomId: newRoom._id, room: newRoom }
})
