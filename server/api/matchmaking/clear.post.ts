import { Match } from '~/server/models/Match'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { matchId, userId } = body

  if (!matchId || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing matchId or userId' })
  }

  const match = await Match.findById(matchId)
  if (!match) {
    throw createError({ statusCode: 404, statusMessage: 'Match not found' })
  }

  const player = match.players.find(p => p.userId === userId)
  if (!player) {
    throw createError({ statusCode: 404, statusMessage: 'Player not found in match' })
  }

  // Increment clear count
  player.clearCount = (player.clearCount || 0) + 1
  player.lastSeen = new Date()
  await match.save()

  return { success: true, clearCount: player.clearCount }
})
