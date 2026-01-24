import { Match } from '~/server/models/Match'
import { GameMap } from '~/server/models/Map'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { matchId, userId, progress, y } = body

  if (!matchId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing matchId' })
  }

  // Atomic update for progress and lastSeen, while also getting the match data
  let match;
  if (userId) {
    match = await Match.findOneAndUpdate(
      { _id: matchId, 'players.userId': userId },
      {
        $set: {
          'players.$.progress': progress || 0,
          'players.$.y': y || 360,
          'players.$.lastSeen': new Date()
        }
      },
      { new: true }
    )
  }

  // Fallback if userId not provided or matching failed
  if (!match) {
    match = await Match.findById(matchId)
  }

  if (!match) {
    throw createError({ statusCode: 404, statusMessage: 'Match not found' })
  }

  // Find opponent
  const opponent = match.players.find(p => p.userId !== userId)

  // If status is 'ready', fetch map data for the client (only once at start)
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
