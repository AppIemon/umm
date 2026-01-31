import { GameMap } from '~/server/models/Map'
import { Room } from '~/server/models/Room'

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

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { roomId, userId, mapIndex } = body

  if (!roomId || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing roomId or userId' })
  }

  const room = await Room.findById(roomId)
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })

  // If we need a new map (index is beyond current queue)
  if (mapIndex >= (room.mapQueue?.length || 0)) {
    const verifiedCount = await GameMap.countDocuments({ isShared: true, isVerified: true })
    if (verifiedCount > 0) {
      const skip = Math.floor(Math.random() * verifiedCount)
      const newMap = await GameMap.findOne({ isShared: true, isVerified: true }).skip(skip)
      if (newMap) {
        // Atomic push to mapQueue
        await Room.updateOne(
          { _id: roomId },
          { $push: { mapQueue: newMap._id } }
        )

        const mObj = newMap.toObject()
        mObj.engineObstacles = optimizeObstacles(mObj.engineObstacles)
        mObj.enginePortals = optimizeObstacles(mObj.enginePortals)
        return { map: mObj, mapIndex }
      }
    }
    return { map: null, mapIndex }
  }

  // Return existing map from queue
  const existingMapId = room.mapQueue[mapIndex]
  const existingMap = await GameMap.findById(existingMapId)

  if (existingMap) {
    const mObj = existingMap.toObject()
    mObj.engineObstacles = optimizeObstacles(mObj.engineObstacles)
    mObj.enginePortals = optimizeObstacles(mObj.enginePortals)
    return { map: mObj, mapIndex }
  }

  return { map: null, mapIndex }
})
