import { Room } from '~/server/models/Room'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { roomId, matchId, userId } = body // Accept both for compatibility
  const id = roomId || matchId

  if (!id || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing roomId or userId' })
  }

  // Atomic update to increment clearCount
  const result = await Room.updateOne(
    { _id: id, 'players.userId': userId },
    {
      $inc: { 'players.$.clearCount': 1 },
      $set: { 'players.$.lastSeen': new Date() }
    }
  )

  if (result.matchedCount === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Room or Player not found' })
  }

  console.log(`[Clear] Player ${userId} win recorded in room ${id}`)
  return { success: true }
})
