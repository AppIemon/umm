import { GameMap } from '~/server/models/Map'
import { Match } from '~/server/models/Match'
import { User } from '~/server/models/User'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { category, rating, userId } = body

  // Check for an existing waiting match in this category
  const matchFilter: any = {
    category,
    status: 'waiting'
  }

  if (userId) {
    matchFilter['players.userId'] = { $ne: userId }
  }

  let match = await Match.findOne(matchFilter)

  if (match) {
    // Join existing match
    // ONLY query user if valid ObjectId, otherwise it's a guest string
    const isValidId = userId && mongoose.Types.ObjectId.isValid(userId)
    const user = isValidId ? await User.findById(userId) : null
    const username = user?.displayName || user?.username || `Guest_${Math.floor(Math.random() * 1000)}`

    match.players.push({
      userId,
      username,
      progress: 0,
      lastSeen: new Date(),
      isReady: false
    })

    match.status = 'ready'
    await match.save()

    const fullMap = await GameMap.findById(match.map)

    return {
      matchId: match._id,
      status: 'ready',
      opponent: {
        username: match.players[0].username,
        rating: 1000 // Placeholder
      },
      map: fullMap
    }
  } else {
    // Create new match
    // First, pick a map for the match
    let minDiff = 1
    let maxDiff = 100
    const userRating = rating || 1000

    if (userRating < 1200) maxDiff = 12
    else if (userRating < 1600) { minDiff = 8; maxDiff = 20; }
    else if (userRating < 2200) { minDiff = 15; maxDiff = 30; }
    else minDiff = 25

    const matchQuery = { isShared: true, difficulty: { $gte: minDiff, $lte: maxDiff } }
    let randomMapId
    const count = await GameMap.countDocuments(matchQuery)

    if (count > 0) {
      const skip = Math.floor(Math.random() * count)
      const m = await GameMap.findOne(matchQuery).skip(skip).select('_id')
      randomMapId = m._id
    } else {
      const anyCount = await GameMap.countDocuments({ isShared: true })
      const skip = Math.floor(Math.random() * anyCount)
      const m = await GameMap.findOne({ isShared: true }).skip(skip).select('_id')
      randomMapId = m?._id
    }

    if (!randomMapId) {
      throw createError({ statusCode: 404, statusMessage: 'No maps available' })
    }

    const isValidId = userId && mongoose.Types.ObjectId.isValid(userId)
    const userObj = isValidId ? await User.findById(userId) : null
    const username = userObj?.displayName || userObj?.username || `Guest_${Math.floor(Math.random() * 1000)}`

    const newMatch = await Match.create({
      category,
      map: randomMapId,
      status: 'waiting',
      players: [{
        userId,
        username,
        progress: 0,
        lastSeen: new Date(),
        isReady: false
      }]
    })

    return {
      matchId: newMatch._id,
      status: 'waiting',
      message: 'Searching for opponent...'
    }
  }
})
