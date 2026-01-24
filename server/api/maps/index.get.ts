import { connectDB } from '~/server/utils/db'
import { GameMap } from '~/server/models/Map'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { creator, shared } = query

  try {
    await connectDB()
  } catch (e: any) {
    throw createError({
      statusCode: 503,
      statusMessage: 'DB Connection Error. Please check Atlas IP Whitelist (0.0.0.0/0). ' + e.message
    })
  }

  const filter: any = {}

  if (shared === 'true') {
    filter.isShared = true
  } else if (creator) {
    filter.creatorName = { $regex: new RegExp(`^${creator}$`, 'i') }
  }

  try {
    const maps = await GameMap.find(filter)
      .select('-audioData -engineObstacles -enginePortals -autoplayLog -sections -beatTimes')
      .sort({ createdAt: -1 })
      .limit(50)
    return maps
  } catch (e: any) {
    console.error("Map Fetch Error:", e);
    throw createError({
      statusCode: 500,
      statusMessage: `DB Error: ${e.message}`
    })
  }
})
