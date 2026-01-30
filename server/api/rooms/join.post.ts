import { Room } from '~/server/models/Room'
import { User } from '~/server/models/User'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { roomId, userId, username: passedUsername } = body

  if (!roomId || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  const room = await Room.findById(roomId)
  if (!room) {
    throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  }

  if (room.status !== 'waiting') {
    throw createError({ statusCode: 403, statusMessage: 'Game already started' })
  }

  if (room.players.length >= room.maxPlayers) {
    throw createError({ statusCode: 403, statusMessage: 'Room is full' })
  }

  // Check if joined
  const existingPlayer = room.players.find((p: any) => p.userId === userId)
  if (existingPlayer) {
    return { success: true, roomId: room._id }
  }

  // Get user info
  const isValidId = mongoose.Types.ObjectId.isValid(userId)
  const user = isValidId ? await User.findById(userId) : null
  const username = passedUsername || user?.displayName || user?.username || `Guest_${Math.floor(Math.random() * 1000)}`

  room.players.push({
    userId,
    username,
    isHost: false,
    isReady: false,
    progress: 0,
    y: 360,
    lastSeen: new Date()
  })

  await room.save()

  return { success: true, roomId: room._id }
})
