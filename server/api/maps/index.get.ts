import { GameMap } from '~/server/models/Map'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { creator, shared } = query

  const filter: any = {}

  if (shared === 'true') {
    filter.isShared = true
  } else if (creator) {
    filter.creatorName = { $regex: new RegExp(`^${creator}$`, 'i') }
  }

  try {
    const maps = await GameMap.find(filter)
      .select('-audioData')
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
