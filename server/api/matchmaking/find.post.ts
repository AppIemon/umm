import { GameMap } from '~/server/models/Map'
import { Match } from '~/server/models/Match'
import { User } from '~/server/models/User'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { category, rating, userId } = body

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing userId' })
  }

  console.log(`[Matchmaking] User ${userId} searching for category: ${category}`)

  // 1. Check if user is already in an active match (prevent duplicates)
  const existingMatch = await Match.findOne({
    category,
    status: { $in: ['waiting', 'ready', 'playing'] },
    'players.userId': userId
  })

  if (existingMatch) {
    console.log(`[Matchmaking] User ${userId} already in match ${existingMatch._id} (${existingMatch.status})`)
    const opponent = existingMatch.players.find(p => p.userId !== userId)
    const map = await GameMap.findById(existingMatch.map)

    return {
      matchId: existingMatch._id,
      status: existingMatch.status,
      opponent: opponent ? {
        username: opponent.username,
        rating: 1000
      } : null,
      map: map
    }
  }

  // 2. Try to join an existing waiting match
  // Filter for 'waiting' matches that are NOT the current user and are ACTIVE (polled within 15s)
  const activeThreshold = new Date(Date.now() - 15000)

  // Create user info for push
  const isValidId = mongoose.Types.ObjectId.isValid(userId)
  const user = isValidId ? await User.findById(userId) : null
  const username = user?.displayName || user?.username || `Guest_${Math.floor(Math.random() * 1000)}`

  const match = await Match.findOneAndUpdate(
    {
      category,
      status: 'waiting',
      'players.userId': { $ne: userId },
      'players.0.lastSeen': { $gte: activeThreshold }
    },
    {
      $push: {
        players: {
          userId,
          username,
          progress: 0,
          y: 360,
          lastSeen: new Date(),
          isReady: false
        }
      },
      $set: { status: 'ready' }
    },
    { new: true }
  )

  if (match) {
    console.log(`[Matchmaking] User ${userId} joined match ${match._id}`)
    const fullMap = await GameMap.findById(match.map)
    const opponent = match.players.find(p => p.userId !== userId)

    return {
      matchId: match._id,
      status: 'ready',
      opponent: {
        username: opponent?.username || 'Opponent',
        rating: 1000
      },
      map: fullMap
    }
  }

  // 3. Create new match if none available
  let minDiff = 1
  let maxDiff = 100
  const userRating = rating || 1000

  if (userRating < 1200) maxDiff = 12
  else if (userRating < 1600) { minDiff = 8; maxDiff = 20; }
  else if (userRating < 2200) { minDiff = 15; maxDiff = 30; }
  else minDiff = 25

  const mapQuery = { isShared: true, difficulty: { $gte: minDiff, $lte: maxDiff } }
  const count = await GameMap.countDocuments(mapQuery)
  let randomMapId

  if (count > 0) {
    const skip = Math.floor(Math.random() * count)
    const m = await GameMap.findOne(mapQuery).skip(skip).select('_id')
    randomMapId = m?._id
  } else {
    // Fallback to any shared map
    const anyCount = await GameMap.countDocuments({ isShared: true })
    if (anyCount > 0) {
      const skip = Math.floor(Math.random() * anyCount)
      const m = await GameMap.findOne({ isShared: true }).skip(skip).select('_id')
      randomMapId = m?._id
    }
  }

  if (!randomMapId) {
    throw createError({ statusCode: 404, statusMessage: 'No maps available' })
  }

  const newMatch = await Match.create({
    category,
    map: randomMapId,
    status: 'waiting',
    players: [{
      userId,
      username,
      progress: 0,
      y: 360,
      lastSeen: new Date(),
      isReady: false
    }]
  })

  console.log(`[Matchmaking] User ${userId} created new match ${newMatch._id}`)

  return {
    matchId: newMatch._id,
    status: 'waiting',
    message: 'Searching for opponent...'
  }
})
