import { Room } from '~/server/models/Room'

export default defineEventHandler(async (event) => {
  const roomId = event.context.params?.id
  const query = getQuery(event)
  const userId = query.userId as string

  // Update lastSeen if userId provided
  if (roomId && userId) {
    // We can maximize performance by not waiting for this write
    Room.updateOne(
      { _id: roomId, 'players.userId': userId },
      { $set: { 'players.$.lastSeen': new Date() } }
    ).exec().catch(console.error)
  }

  const room = await Room.findById(roomId)
    .populate('map') // Populate map if game started

  if (!room) {
    throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  }

  // Cleanup inactive players (timeout > 15s)
  // Only host should do this? Or automatic?
  // For now, simpler is better: return room state

  // Optimization Helper
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

  // Optimize map data if present
  let optimizedMap = room.map as any
  if (optimizedMap && optimizedMap.engineObstacles) {
    const mObj = optimizedMap.toObject ? optimizedMap.toObject() : optimizedMap
    mObj.engineObstacles = optimizeObstacles(mObj.engineObstacles)
    mObj.enginePortals = optimizeObstacles(mObj.enginePortals)
    optimizedMap = mObj
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
      messages: room.messages
    }
  }
})
