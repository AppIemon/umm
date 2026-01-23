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

  const maps = await GameMap.find(filter).sort({ createdAt: -1 }).limit(50)
  return maps
})
