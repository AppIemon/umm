import { Match } from '~/server/models/Match'
import { GameMap } from '~/server/models/Map'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { matchId, userId, progress, y } = body

  if (!matchId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing matchId' })
  }

  const match = await Match.findById(matchId)
  if (!match) {
    throw createError({ statusCode: 404, statusMessage: 'Match not found' })
  }

  // Update caller's progress, y and lastSeen
  const player = match.players.find(p => p.userId === userId)
  if (player) {
    player.progress = progress || 0
    player.y = y || 360
    player.lastSeen = new Date()
    await match.save()
  }

  // Find opponent
  const opponent = match.players.find(p => p.userId !== userId)

  // If status is 'ready', fetch map data for the client
  let mapData = null
  if (match.status === 'ready' || match.status === 'playing') {
    mapData = await GameMap.findById(match.map)
  }

  return {
    status: match.status,
    opponent: opponent ? {
      username: opponent.username,
      progress: opponent.progress,
      y: opponent.y,
      lastSeen: opponent.lastSeen
    } : null,
    map: mapData
  }
})
