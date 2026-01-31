import { GameMap } from '~/server/models/Map'
import { Room } from '~/server/models/Room'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { roomId, userId, mapIndex } = body

  if (!roomId || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing roomId or userId' })
  }

  const room = await Room.findById(roomId)
  if (!room) {
    throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  }

  // Check if map queue already has this index
  if (!room.mapQueue) {
    room.mapQueue = []
    if (room.map) room.mapQueue.push(room.map)
  }

  // If we need a new map (index is beyond current queue)
  if (mapIndex >= room.mapQueue.length) {
    // If we need a new map (index is beyond current queue) -> But we pre-generated all!
    // So this case should technically not happen if we respect the rounds.
    // However, if we need to support infinite mode or fallback:

    // Find verified maps?
    const verifiedCount = await GameMap.countDocuments({ isShared: true, isVerified: true })
    if (verifiedCount > 0) {
      const skip = Math.floor(Math.random() * verifiedCount)
      const newMap = await GameMap.findOne({ isShared: true, isVerified: true }).skip(skip)
      if (newMap) {
        room.mapQueue.push(newMap._id)
        await room.save()
        return { map: newMap, mapIndex }
      }
    }

    // ... Fallback logic if needed, but for now just return null
    return { map: null, mapIndex }
  }

  // Return existing map from queue
  const existingMapId = room.mapQueue[mapIndex]
  const existingMap = await GameMap.findById(existingMapId)
  return { map: existingMap, mapIndex }
})
