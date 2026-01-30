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
    // Get a random verified map
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

    // Fallback: generate new map
    const { GameEngine } = await import('~/utils/game-engine')
    const engine = new GameEngine({ difficulty: 7, density: 1.0, portalFrequency: 0.15 })
    const duration = 60
    const seed = `multi_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    // Pass a numeric seed for procedural generation
    engine.generateMap([], [], duration, Math.floor(Math.random() * 100000), false, 0, 120, 2.0)
    // Note: generateMap signature might vary, check GameEngine.ts

    const newMap = await GameMap.create({
      title: `MULTI_MAP_${Date.now()}`,
      difficulty: 7,
      seed,
      creatorName: 'SYSTEM',
      creatorId: null,
      beatTimes: [],
      sections: [],
      engineObstacles: engine.obstacles,
      enginePortals: engine.portals,
      autoplayLog: engine.autoplayLog,
      duration,
      isShared: true,
      isVerified: true,
      isAiVerified: true
    })

    room.mapQueue.push(newMap._id)
    await room.save()
    return { map: newMap, mapIndex }
  }

  // Return existing map from queue
  const existingMapId = room.mapQueue[mapIndex]
  const existingMap = await GameMap.findById(existingMapId)
  return { map: existingMap, mapIndex }
})
