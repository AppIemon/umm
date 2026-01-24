import { GameMap } from '~/server/models/Map'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { category, rating } = body

  // Rating-based Difficulty Logic (Simple)
  // Rating 1000 (Base) -> Difficulty ~10
  // Each +100 rating -> +1 Difficulty aprox?
  // Let's keep it simple: 
  // Easy: 1-10 (Rating < 1200)
  // Normal: 8-18 (Rating 1200-1500)
  // Hard: 15-25 (Rating 1500-2000)
  // Insane: 20+ (Rating > 2000)

  let minDiff = 1
  let maxDiff = 100

  const userRating = rating || 1000

  if (userRating < 1200) {
    maxDiff = 12
  } else if (userRating < 1600) {
    minDiff = 8
    maxDiff = 20
  } else if (userRating < 2200) {
    minDiff = 15
    maxDiff = 30
  } else {
    minDiff = 25
  }

  // Find maps within difficulty range
  // Must be shared
  const matchQuery = {
    isShared: true,
    difficulty: { $gte: minDiff, $lte: maxDiff }
  }

  try {
    // Get count first to pick random
    const count = await GameMap.countDocuments(matchQuery)

    let randomMap
    if (count > 0) {
      const skip = Math.floor(Math.random() * count)
      randomMap = await GameMap.findOne(matchQuery).skip(skip).select('-engineObstacles -enginePortals')
    } else {
      // Fallback to any shared map if no specific difficulty found
      const anyCount = await GameMap.countDocuments({ isShared: true })
      if (anyCount > 0) {
        const skip = Math.floor(Math.random() * anyCount)
        randomMap = await GameMap.findOne({ isShared: true }).skip(skip).select('-engineObstacles -enginePortals')
      }
    }

    if (!randomMap) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No maps available for matchmaking'
      })
    }

    // In a real system, we might fetch a specific User Replay here.
    // For now, we return the map. The client will use 'autoplayLog' (AI) as the opponent.
    // Retrieve the full map data (including heavy fields like audioData and autoplayLog) 
    // because the client needs it to play.
    const fullMap = await GameMap.findById(randomMap._id)

    return {
      matchId: `match_${Date.now()}_${randomMap._id}`,
      opponent: {
        username: fullMap.bestPlayer || 'AI_GHOST', // Use best player name or AI
        rating: userRating + (Math.random() * 100 - 50) // Fake opponent rating for display
      },
      map: fullMap
    }

  } catch (e: any) {
    console.error("Matchmaking Error:", e)
    throw createError({
      statusCode: 500,
      statusMessage: "Matchmaking Service Unavailable"
    })
  }
})
