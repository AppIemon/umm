import { Room } from '~/server/models/Room'
import { User } from '~/server/models/User'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { roomId, userId, username: passedUsername } = body

  if (!roomId || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  // 1. Check if room exists and is joinable
  const room = await Room.findById(roomId)
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  if (room.status !== 'waiting') throw createError({ statusCode: 403, statusMessage: 'Game already started' })

  // 2. Check if already in
  const existingPlayer = room.players.find((p: any) => p.userId === userId)
  if (existingPlayer) return { success: true, roomId: room._id }

  if (room.players.length >= room.maxPlayers) {
    throw createError({ statusCode: 403, statusMessage: 'Room is full' })
  }

  // 3. Get user info
  const isValidId = mongoose.Types.ObjectId.isValid(userId)
  const user = isValidId ? await User.findById(userId) : null
  const username = passedUsername || user?.displayName || user?.username || `Guest_${Math.floor(Math.random() * 1000)}`

  // 4. Atomic Push
  const result = await Room.updateOne(
    { _id: roomId, status: 'waiting', 'players.userId': { $ne: userId } },
    {
      $push: {
        players: {
          userId,
          username,
          isHost: false,
          isReady: false,
          progress: 0,
          y: 360,
          lastSeen: new Date()
        }
      }
    }
  )

  if (result.matchedCount === 0) {
    // Check if it was because game started or room full
    const check = await Room.findById(roomId)
    if (!check) throw createError({ statusCode: 404, statusMessage: 'Room disappeared' })
    if (check.status !== 'waiting') throw createError({ statusCode: 403, statusMessage: 'Game started' })
    if (check.players.length >= check.maxPlayers) throw createError({ statusCode: 403, statusMessage: 'Full' })
    // If we're already in, it's fine
    if (check.players.some((p: any) => p.userId === userId)) return { success: true, roomId: check._id }
  }

  return { success: true, roomId: room._id }
})
