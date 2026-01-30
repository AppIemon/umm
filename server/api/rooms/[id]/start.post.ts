import { Room } from '~/server/models/Room'
import { GameMap } from '~/server/models/Map'

export default defineEventHandler(async (event) => {
  const roomId = event.context.params?.id
  const body = await readBody(event)
  const { userId } = body // Host ID

  const room = await Room.findById(roomId)
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })

  if (room.hostId !== userId) {
    throw createError({ statusCode: 403, statusMessage: 'Only host can start game' })
  }

  if (room.status !== 'waiting') {
    return { success: true } // Already started
  }

  // 1. Generate/Select Map
  // Use existing map generation logic or find a verified map
  // For simplicity, let's generate a new system map for this room

  // Try to find a verified map first
  const verifiedMapCount = await GameMap.countDocuments({ isShared: true, isVerified: true })
  let selectedMapId = null

  if (verifiedMapCount > 0) {
    const skip = Math.floor(Math.random() * verifiedMapCount)
    const m = await GameMap.findOne({ isShared: true, isVerified: true }).skip(skip).select('_id')
    selectedMapId = m?._id
  }

  // If no map, generate one (Fallback)
  if (!selectedMapId) {
    const { GameEngine } = await import('~/utils/game-engine')
    const engine = new GameEngine({ difficulty: room.difficulty || 5 })

    // Seed must be a Number for the GameMap model
    const seed = Math.floor(Math.random() * 1000000)
    engine.generateMap([], [], room.duration || 60, seed, false)

    // Find a valid creator ObjectId (Mongoose requires a valid ID for 'creator' field)
    const hostIsRegistered = mongoose.Types.ObjectId.isValid(room.hostId)
    const creatorId = hostIsRegistered ? room.hostId : new mongoose.Types.ObjectId("000000000000000000000000") // Fallback valid ID

    const hostPlayer = room.players.find((p: any) => p.isHost)

    const newMap = await GameMap.create({
      title: `ROOM_${room.title}`,
      difficulty: room.difficulty || 5,
      seed,
      creator: creatorId,
      creatorName: hostPlayer?.username || 'SYSTEM',
      beatTimes: [],
      sections: [],
      engineObstacles: engine.obstacles,
      enginePortals: engine.portals,
      autoplayLog: [],
      duration: room.duration || 60,
      isShared: false,
      isVerified: true
    })
    selectedMapId = newMap._id
  }

  // 2. Start Game
  room.map = selectedMapId
  room.status = 'playing'
  room.players.forEach((p: any) => {
    p.progress = 0
    p.isReady = false // Reset ready for replay?
  })

  await room.save()

  return { success: true, mapId: selectedMapId }
})
