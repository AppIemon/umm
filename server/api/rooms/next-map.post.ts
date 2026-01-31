import { Room } from '~/server/models/Room'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { roomId, userId, mapIndex } = body

  if (!roomId || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing roomId or userId' })
  }

  const room = await Room.findById(roomId)
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })

  // Maps are now stored directly in mapQueue as objects
  if (mapIndex < (room.mapQueue?.length || 0)) {
    const map = room.mapQueue[mapIndex]
    return { map, mapIndex }
  }

  // If queue exhausted (shouldn't happen with our incremental d+=10 logic), 
  // we could generate more, but for now just return last.
  if (room.mapQueue && room.mapQueue.length > 0) {
    return { map: room.mapQueue[room.mapQueue.length - 1], mapIndex: room.mapQueue.length - 1 }
  }

  return { map: null, mapIndex }
})
