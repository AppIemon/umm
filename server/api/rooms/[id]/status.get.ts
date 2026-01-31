import { Room } from '~/server/models/Room'

export default defineEventHandler(async (event) => {
  const roomId = event.context.params?.id
  const query = getQuery(event)
  const userId = query.userId as string

  // Update lastSeen if userId provided
  if (roomId && userId) {
    Room.updateOne(
      { _id: roomId, 'players.userId': userId },
      { $set: { 'players.$.lastSeen': new Date() } }
    ).exec().catch(console.error)
  }

  const room = await Room.findById(roomId)
  if (!room) {
    throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  }

  // Optimization Helper (Actually maps are already optimized in start.post.ts)
  // But we can re-verify or optimize just in case.
  const roundNum = (num: number, precision: number = 1) => {
    if (typeof num !== 'number' || isNaN(num)) return 0
    const factor = Math.pow(10, precision)
    return Math.round(num * factor) / factor
  }

  const optimizeObstacles = (obs: any[]) => {
    if (!Array.isArray(obs)) return []
    return obs.map(o => ({
      ...o,
      x: roundNum(o.x),
      y: roundNum(o.y),
      width: roundNum(o.width),
      height: roundNum(o.height)
    }))
  }

  let optimizedMap = room.map
  if (optimizedMap && optimizedMap.engineObstacles && !optimizedMap._alreadyOptimized) {
    optimizedMap.engineObstacles = optimizeObstacles(optimizedMap.engineObstacles)
    optimizedMap.enginePortals = optimizeObstacles(optimizedMap.enginePortals)
    optimizedMap._alreadyOptimized = true
  }

  return {
    room: {
      _id: room._id,
      title: room.title,
      status: room.status,
      maxPlayers: room.maxPlayers,
      players: room.players,
      hostId: room.hostId,
      map: optimizedMap,
      duration: room.duration,
      startedAt: room.startedAt,
      messages: room.messages
    }
  }
})
