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
  console.log('[StartGame] ===== START.POST CALLED =====')

  const roomId = event.context.params?.id
  const body = await readBody(event)
  const { userId } = body // Host ID

  console.log('[StartGame] roomId:', roomId)
  console.log('[StartGame] userId:', userId)

  const room = await Room.findById(roomId)
  console.log('[StartGame] Room found:', room ? 'YES' : 'NO')
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })

  console.log('[StartGame] Room title:', room.title)
  console.log('[StartGame] Room hostId:', room.hostId)
  console.log('[StartGame] Room status:', room.status)
  console.log('[StartGame] Room players count:', room.players?.length)

  if (room.hostId !== userId) {
    console.log('[StartGame] ERROR: User is not host')
    throw createError({ statusCode: 403, statusMessage: 'Only host can start game' })
  }

  if (room.status !== 'waiting') {
    console.log('[StartGame] Room already started, returning success')
    return { success: true } // Already started
  }

  try {
    console.log('[StartGame] Starting map generation...')

    const { GameEngine } = await import('~/utils/game-engine')
    console.log('[StartGame] GameEngine imported successfully')

    const engine = new GameEngine({ difficulty: room.difficulty || 10 })
    console.log('[StartGame] GameEngine instance created with difficulty:', room.difficulty || 10)

    const seed = Math.floor(Math.random() * 1000000)
    const hostPlayer = room.players.find((p: any) => p.isHost)
    const maxDuration = room.duration || 120
    const rounds: any[] = []

    console.log('[StartGame] seed:', seed)
    console.log('[StartGame] hostPlayer:', hostPlayer?.nickname)
    console.log('[StartGame] maxDuration:', maxDuration, 's')
    console.log('[StartGame] musicBpm:', room.musicBpm)
    console.log('[StartGame] musicMeasureLength:', room.musicMeasureLength)
    console.log(`[StartGame] Room ${room.title} duration: ${maxDuration}s. Generating inline rounds...`)

    // Incremental duration rounds: 10, 20, 30... maxDuration
    let currentDifficulty = room.difficulty || 10;

    for (let d = 10; d <= maxDuration; d += 10) {
      console.log(`[StartGame] Generating round ${d / 10}: duration=${d}s, difficulty=${currentDifficulty}`)

      // Increase difficulty each round
      engine.setMapConfig({ difficulty: currentDifficulty })

      engine.generateMap([], [], d, seed, false, 0, room.musicBpm || 120, room.musicMeasureLength || 2.0)

      console.log(`[StartGame] Round ${d / 10} generated: obstacles=${engine.obstacles?.length}, portals=${engine.portals?.length}`)

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

    console.log(`[StartGame] Total rounds generated: ${rounds.length}`)

    // ATOMIC UPDATE
    console.log('[StartGame] Updating room with generated maps (ATOMIC UPDATE)...')

    const updatedRoom = await Room.findOneAndUpdate(
      { _id: roomId, status: 'waiting' },
      {
        $set: {
          map: rounds[0],
          mapQueue: rounds,
          status: 'playing',
          startedAt: new Date(),
          'players.$[].progress': 0,
          'players.$[].maxProgress': 0,
          'players.$[].isReady': false
        }
      },
      { new: true }
    )

    console.log('[StartGame] Room update result:', updatedRoom ? 'SUCCESS' : 'FAILED')

    if (!updatedRoom) {
      console.log('[StartGame] Room update failed, checking room again...')
      const checkAgain = await Room.findById(roomId)
      console.log('[StartGame] Room status now:', checkAgain?.status)
      if (checkAgain?.status === 'playing') return { success: true }
      throw new Error('Room state changed or room was deleted during map generation')
    }

    console.log(`[StartGame] ===== GAME STARTED SUCCESSFULLY =====' `)
    console.log(`[StartGame] Room: ${room.title}`)
    console.log(`[StartGame] Rounds: ${rounds.length}`)
    console.log(`[StartGame] First map obstacles: ${rounds[0]?.engineObstacles?.length}`)
    console.log(`[StartGame] First map portals: ${rounds[0]?.enginePortals?.length}`)

    return { success: true }
  } catch (err: any) {
    console.error('[StartGame] Fatal error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to start: ${err.message || 'Unknown error'}`
    })
  }
})
