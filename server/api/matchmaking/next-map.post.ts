import { GameMap } from '~/server/models/Map'
import { Match } from '~/server/models/Match'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { matchId, userId, mapIndex } = body

  if (!matchId || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing matchId or userId' })
  }

  const match = await Match.findById(matchId)
  if (!match) {
    throw createError({ statusCode: 404, statusMessage: 'Match not found' })
  }

  // Check if map queue already has this index
  if (!match.mapQueue) {
    match.mapQueue = [match.map] // Initialize with first map
  }

  // If we need a new map
  if (mapIndex >= match.mapQueue.length) {
    // Get a random verified map
    const verifiedCount = await GameMap.countDocuments({ isShared: true, isVerified: true })
    if (verifiedCount > 0) {
      const skip = Math.floor(Math.random() * verifiedCount)
      const newMap = await GameMap.findOne({ isShared: true, isVerified: true }).skip(skip)
      if (newMap) {
        match.mapQueue.push(newMap._id)
        await match.save()
        return { map: newMap, mapIndex }
      }
    }

    // Fallback: generate new map
    const { GameEngine } = await import('~/utils/game-engine')
    const engine = new GameEngine({ difficulty: 7, density: 1.0, portalFrequency: 0.15 })
    const duration = 60
    const seed = `multi_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    engine.generateMap(seed, duration, [])

    const success = engine.computeAutoplayLog(200, 360)
    if (!success) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to generate map' })
    }

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

    match.mapQueue.push(newMap._id)
    await match.save()
    return { map: newMap, mapIndex }
  }

  // Return existing map from queue
  const existingMapId = match.mapQueue[mapIndex]
  const existingMap = await GameMap.findById(existingMapId)
  return { map: existingMap, mapIndex }
})
