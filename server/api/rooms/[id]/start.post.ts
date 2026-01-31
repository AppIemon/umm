import { Room } from '~/server/models/Room'
import mongoose from 'mongoose'

const roundNum = (num: number, precision: number = 1) => {
  if (typeof num !== 'number' || isNaN(num)) return 0
  const factor = Math.pow(10, precision)
  return Math.round(num * factor) / factor
}

const optimizeObstacles = (obs: any[]) => {
  if (!Array.isArray(obs)) return []
  return obs.map(o => {
    const optimized: any = {
      ...o,
      x: roundNum(o.x),
      y: roundNum(o.y),
      width: roundNum(o.width),
      height: roundNum(o.height)
    }
    if (o.children) optimized.children = optimizeObstacles(o.children)
    return optimized
  })
}

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

  try {
    const { GameEngine } = await import('~/utils/game-engine')
    const engine = new GameEngine({ difficulty: room.difficulty || 10 })

    const seed = Math.floor(Math.random() * 1000000)
    const hostPlayer = room.players.find((p: any) => p.isHost)
    const maxDuration = room.duration || 120
    const rounds: any[] = []

    console.log(`[StartGame] Room ${room.title} duration: ${maxDuration}s. Generating inline rounds...`)

    // Incremental duration rounds: 10, 20, 30... maxDuration
    let currentDifficulty = room.difficulty || 10;

    for (let d = 10; d <= maxDuration; d += 10) {
      // Increase difficulty each round
      engine.setMapConfig({ difficulty: currentDifficulty })

      engine.generateMap([], [], d, seed, false)

      // We no longer save to GameMap collection to avoid database bloat.
      // Maps are stored inline within the Room document.
      const mapData = {
        _id: new mongoose.Types.ObjectId(), // Virtual ID for tracking
        title: `ROOM_${room.title}_ROUND_${d / 10}`,
        difficulty: currentDifficulty,
        seed,
        engineObstacles: optimizeObstacles(engine.obstacles),
        enginePortals: optimizeObstacles(engine.portals),
        duration: d,
        audioUrl: room.musicUrl || null,
        isVerified: true,
        createdAt: new Date()
      }
      rounds.push(mapData)
      currentDifficulty++; // Next round is harder

      if (rounds.length >= 100) break;
    }

    // ATOMIC UPDATE
    const updatedRoom = await Room.findOneAndUpdate(
      { _id: roomId, status: 'waiting' },
      {
        $set: {
          map: rounds[0],
          mapQueue: rounds,
          status: 'playing',
          startedAt: new Date(),
          'players.$[].progress': 0,
          'players.$[].isReady': false
        }
      },
      { new: true }
    )

    if (!updatedRoom) {
      const checkAgain = await Room.findById(roomId)
      if (checkAgain?.status === 'playing') return { success: true }
      throw new Error('Room state changed or room was deleted during map generation')
    }

    console.log(`[StartGame] Successfully started game in room ${roomId} with ${rounds.length} inline rounds.`)

    return { success: true }
  } catch (err: any) {
    console.error('[StartGame] Fatal error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to start: ${err.message || 'Unknown error'}`
    })
  }
})
