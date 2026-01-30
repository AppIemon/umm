import { Room } from '~/server/models/Room'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { matchId, userId } = body // Frontend sends 'matchId' but it is actually roomId

  if (!matchId || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing matchId (roomId) or userId' })
  }

  const room = await Room.findById(matchId)
  if (!room) {
    throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  }

  const player = room.players.find(p => p.userId === userId)
  if (!player) {
    throw createError({ statusCode: 404, statusMessage: 'Player not found in room' })
  }

  // Increment clear count
  player.clearCount = (player.clearCount || 0) + 1
  player.lastSeen = new Date()
  await room.save()

  return { success: true, clearCount: player.clearCount }
})
