import { Room } from '~/server/models/Room'
import { GameMap } from '~/server/models/Map'
import mongoose from 'mongoose'

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

  // 1. Generate Progressive Maps

  const { GameEngine } = await import('~/utils/game-engine')
  const engine = new GameEngine({ difficulty: room.difficulty || 5 })

  const seed = Math.floor(Math.random() * 1000000)
  const hostIsRegistered = mongoose.Types.ObjectId.isValid(room.hostId)
  const creatorId = hostIsRegistered ? room.hostId : new mongoose.Types.ObjectId("000000000000000000000000") // Fallback valid ID
  const hostPlayer = room.players.find((p: any) => p.isHost)

  const maxDuration = room.duration || 60
  const rounds = []

  // First map is 20s minimum (to avoid too short rounds), then +10s
  // User asked: "First 10s -> +10s"
  let startD = 10;

  for (let d = startD; d <= maxDuration; d += 10) {
    engine.generateMap([], [], d, seed, false)

    const newMap = await GameMap.create({
      title: `ROOM_${room.title}_ROUND_${d / 10}`,
      difficulty: room.difficulty || 5,
      seed,
      creator: creatorId,
      creatorName: hostPlayer?.username || 'SYSTEM',
      beatTimes: [],
      sections: [],
      engineObstacles: JSON.parse(JSON.stringify(engine.obstacles)),
      enginePortals: JSON.parse(JSON.stringify(engine.portals)),
      autoplayLog: [],
      audioUrl: room.musicUrl || null,
      duration: d, // Increasing duration
      isShared: false,
      isVerified: true
    })
    rounds.push(newMap._id)
  }

  // If loop didn't run (e.g. duration < 10), make one full map
  if (rounds.length === 0) {
    engine.generateMap([], [], maxDuration, seed, false)
    const newMap = await GameMap.create({
      title: `ROOM_${room.title}_ROUND_1`,
      difficulty: room.difficulty || 5,
      seed,
      creator: creatorId,
      creatorName: hostPlayer?.username || 'SYSTEM',
      beatTimes: [],
      sections: [],
      engineObstacles: engine.obstacles,
      enginePortals: engine.portals,
      autoplayLog: [],
      audioUrl: room.musicUrl || null,
      duration: maxDuration,
      isShared: false,
      isVerified: true
    })
    rounds.push(newMap._id)
  }

  // 2. Start Game
  room.map = rounds[0]
  room.mapQueue = rounds
  room.status = 'playing'
  room.players.forEach((p: any) => {
    p.progress = 0
    p.isReady = false
  })

  await room.save()

  // Return first map
  return { success: true, mapId: rounds[0] }


})
