import { Room } from '~/server/models/Room'
import { GameMap } from '~/server/models/Map'
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
    const engine = new GameEngine({ difficulty: room.difficulty || 5 })

    const seed = Math.floor(Math.random() * 1000000)

    // Ensure creatorId is a valid ObjectId
    const hostIsRegistered = mongoose.Types.ObjectId.isValid(room.hostId)
    const creatorId = hostIsRegistered ? new mongoose.Types.ObjectId(room.hostId) : new mongoose.Types.ObjectId("000000000000000000000000")

    const hostPlayer = room.players.find((p: any) => p.isHost)

    const maxDuration = room.duration || 60
    const rounds = []

    // Incremental duration rounds: 10, 20, 30... maxDuration
    let startD = 10;

    console.log(`[StartGame] Room ${room.title} duration: ${maxDuration}s. Generating rounds...`)

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
        engineObstacles: optimizeObstacles(engine.obstacles),
        enginePortals: optimizeObstacles(engine.portals),
        autoplayLog: [],
        audioUrl: room.musicUrl || null,
        duration: d,
        isShared: false,
        isVerified: true
      })
      rounds.push(newMap._id)

      if (rounds.length >= 200) break;
    }

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
        engineObstacles: optimizeObstacles(engine.obstacles),
        enginePortals: optimizeObstacles(engine.portals),
        autoplayLog: [],
        audioUrl: room.musicUrl || null,
        duration: maxDuration,
        isShared: false,
        isVerified: true
      })
      rounds.push(newMap._id)
    }

    // ATOMIC UPDATE to avoid VersionError (No matching document found)
    // This happens because concurrent polling updates player status while map gen is running
    const updatedRoom = await Room.findOneAndUpdate(
      { _id: roomId, status: 'waiting' }, // Ensure we only start if still waiting
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
      // If it failed, check if it was already started or lost
      const checkAgain = await Room.findById(roomId)
      if (checkAgain?.status === 'playing') return { success: true, mapId: checkAgain.map }
      throw new Error('Room state changed or room was deleted during map generation')
    }

    console.log(`[StartGame] Successfully started game in room ${roomId} with ${rounds.length} rounds.`)

    return { success: true, mapId: rounds[0] }
  } catch (err: any) {
    console.error('[StartGame] Fatal error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to start: ${err.message || 'Unknown error'}`
    })
  }
})
